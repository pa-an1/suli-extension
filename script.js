var userInfo = {};
var numberOfPage = 0;
var countRequestDone = 0;
var products = [];
var level2Gift = [];
var eventTime = 1543424400000;
var RANKS = ['Bạc', 'Vàng', 'Bạch Kim', 'Kim Cương'];
var TEMPLATES = [];
getTemplate();

function getTemplate() {
  var fullURL = chrome.runtime.getURL("template.html");
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var templates = xhttp.responseText.split('<!-- -------------------------------------- -->');
      TEMPLATES = templates.filter(function(_, i) {
        return i !== 0 && i !== templates.length - 1;
      });
      getProducts();
    }
  };
  xhttp.open("GET", fullURL, true);
  xhttp.send();
}

function getProducts() {
  chrome.storage.sync.get('products', function(data) {
    products = data.products;
    startRender();
  });
}

function startRender() {
  var pages = document.getElementsByClassName('la-print-page');
  numberOfPage = pages.length;
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var phoneNumber = page.querySelectorAll('#phone')[1].textContent.trim();
    console.log(phoneNumber);
    getInfo(phoneNumber);
  }
}

function getInfo(phoneNumber) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      var info =  JSON.parse(xhttp.responseText);
      for (var i = 0; i < info.orders.length; i++) {
        info.orders[i].Createdat = (new Date(info.orders[i].Createdat)).getTime();
      }
      userInfo[phoneNumber] = info;
      checkGetInfoIsDone();
      console.log(info);
    }
  };
  xhttp.open("GET", "https://lazada-suli.herokuapp.com/user/" + phoneNumber, true);
  xhttp.send();
}

function checkGetInfoIsDone() {
  countRequestDone++;
  if (countRequestDone == numberOfPage) {
    render();
  }
}

function toCamelName(name) {
  var words = name.split(' ');
  var camelWords = [];
  for (var i = 0; i < words.length; i++) {
    var word = words[i];
    if (word.length > 0) {
      var firstWord = word[0].toUpperCase();
      var rest = word.substring(1)
      camelWords.push(firstWord + rest);
    }
  }
  return camelWords.join(' ');
}

function getMemberRenderInfo(phoneNumber) {
  var orderBeforeEvent = userInfo[phoneNumber].orders.filter(function(order) {
    return order.Createdat < eventTime;
  }).length;
  var orderAfterEvent = userInfo[phoneNumber].orders.filter(function(order) {
    return order.Createdat >= eventTime;
  }).length;

  var template = 0;
  var ranking = 0;
  var greeting = 'Như đã hứa';
  if (orderBeforeEvent === 0) {
    if (orderAfterEvent === 0) {
      template = 0;
    } else if (orderAfterEvent === 1) {
      template = 1;
    } else {
      if ((orderAfterEvent - 2) % 3 === 0) {
        template = 2;
      } else if ((orderAfterEvent - 2) % 3 === 1) {
        template = 3;
      } else if ((orderAfterEvent - 2) % 3 === 2) {
        template = 1;
      }
      ranking = Math.floor((orderAfterEvent - 2) / 3);
    }
  } else {
    if (orderAfterEvent === 0) {
      template = 1;
      greeting = 'Để cảm ơn sự gắn bó của bạn đối với shop trong thời gian vừa qua,';
    } else {
      if ((orderAfterEvent - 1) % 3 === 0) {
        template = 2;
      } else if ((orderAfterEvent - 1) % 3 === 1) {
        template = 3;
      } else if ((orderAfterEvent - 1) % 3 === 2) {
        template = 1;
      }
      ranking = Math.floor((orderAfterEvent - 1) / 3);
    }
  }
  return { template, ranking, greeting };
}

function getUserOrderedItemId(info) {
  var result = [];
  for (var i = 0; i < info.orders.length; i++) {
    var order = info.orders[i];
    for (var j = 0; j < order.Items.length; j++) {
      var item = order.Items[j];
      result.push(item.SellerSKU);
    }
  }
  return result;
}

function getLevel1Gift(orderedItemIds) {
  var level1Gift = products.filter(function(product) {
    return product.price >= 19000 && product.price <= 29000 && product.quantity > 0 && orderedItemIds.indexOf(product.id) === -1;
  });
  var index = Math.floor(Math.random() * level1Gift.length)
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === level1Gift[index].id) {
      products[i].quantity--;
      break;
    }
  }
  return level1Gift[index];
}

function getLevel2Gift(orderedItemIds) {
  level2Gift = products.filter(function(product) {
    return product.price >= 40000 && product.quantity > 0 && orderedItemIds.indexOf(product.id) === -1;
  });
  var index = Math.floor(Math.random() * level2Gift.length);
  for (var i = 0; i < products.length; i++) {
    if (products[i].id === level2Gift[index].id) {
      products[i].quantity--;
      break;
    }
  }
  return level2Gift[index];
}

function render() {
  var pages = document.getElementsByClassName('la-print-page');
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    page.style.position = 'relative';
    var order = page.getElementsByTagName('table')[0];
    order.style.transform = 'scale(0.7,0.7) rotate(90deg) translateX(-220px)';
    
    var phoneNumber = page.querySelectorAll('#phone')[1].textContent.trim();
    var name = page.getElementsByTagName('tr')[6].getElementsByTagName('span')[0].textContent;
    var memberRenderInfo = getMemberRenderInfo(phoneNumber);

    var html = TEMPLATES[memberRenderInfo.template]
      .replace('<table>', '<table style="width: 700px;height: 450px;position: absolute;top: 540px;">')
      .replace('{name}', toCamelName(name))
      .replace('{member_rank}', RANKS[memberRenderInfo.ranking]);
    if (memberRenderInfo.template === 1) {
      var orderedItemIds = getUserOrderedItemId(userInfo[phoneNumber]);
      var gift = memberRenderInfo.ranking === 0 ? getLevel1Gift(orderedItemIds) : getLevel2Gift(orderedItemIds);
      html = html.replace('{gift_name}', gift.name)
        .replace('{gift_price}', gift.price)
        .replace('{gift_id}', gift.id)
        .replace('{greeting}', memberRenderInfo.greeting);
    }

    page.insertAdjacentHTML('beforeend', html);
  }
  console.log(products);
}