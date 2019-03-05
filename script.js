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
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var templates = xhttp.responseText.split('<!-- -------------------------------------- -->');
      TEMPLATES = templates.filter(function (_, i) {
        return i !== 0 && i !== templates.length - 1;
      });
      getProducts();
    }
  };
  xhttp.open("GET", fullURL, true);
  xhttp.send();
}

function getProducts() {
  chrome.storage.sync.get('products', function (data) {
    products = data.products;
    startRender();
  });
}

function startRender() {
  var pages = document.getElementsByClassName('la-print-page');
  numberOfPage = pages.length;
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var phoneNumber = getUserData(page.innerText).phoneNumber;
    console.log(phoneNumber);
    getInfo(phoneNumber);
  }
}

function getInfo(phoneNumber) {
  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      var info = JSON.parse(xhttp.responseText);
      for (var i = 0; i < info.orders.length; i++) {
        info.orders[i].Createdat = (new Date(info.orders[i].Createdat.replace('ICT', 'GMT+07:00'))).getTime();
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
  var orderBeforeEvent = userInfo[phoneNumber].orders.filter(function (order) {
    return order.Createdat < eventTime;
  }).length;
  var orderAfterEvent = userInfo[phoneNumber].orders.filter(function (order) {
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
      ranking = Math.floor((orderAfterEvent - 1) / 3);
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
      ranking = Math.floor(orderAfterEvent / 3);
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

function getLevel1Gift(orderedItemIds, giftItemIds) {
  var level1Gift = products.filter(function (product) {
    return product.price >= 19000 && product.price <= 29000 && product.quantity > 0 && orderedItemIds.indexOf(product.id) === -1 && giftItemIds.indexOf(product.id) === -1;
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

function getLevel2Gift(orderedItemIds, giftItemIds) {
  level2Gift = products.filter(function (product) {
    return product.price >= 40000 && product.quantity > 0 && orderedItemIds.indexOf(product.id) === -1 && giftItemIds.indexOf(product.id) === -1;
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

function addUserGift(sqlValues) {
  console.log(sqlValues)
  if (!sqlValues) {
    return;
  }
  var xhttp = new XMLHttpRequest();
  xhttp.open("POST", "https://lazada-suli.herokuapp.com/add-user-gift", true);
  xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
  xhttp.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log(xhttp.responseText);
    }
  };
  xhttp.send(`sql_values=${sqlValues}`);
}

function getUserData(innerText) {
  var ORDER_TAG = 'Số đơn hàng:';
  var USER_NAME = 'NGƯỜI NHẬN: ';
  var PHONE_NUMBER = 'SĐT: ';
  var ORDER_PRODUCT_START = 'Tên sản phẩm	Mã	Loại';
  var ORDER_PRODUCT_END = 'Số tiền thu hộ:';
  var startLine = 0;
  var endLine = 0;
  var lines = innerText.split('\n');
  var userData = {};
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i];
    if (line.includes(ORDER_TAG)) {
      userData.orderNumber = line.substring(ORDER_TAG.length).trim();
    } else if (line.includes(USER_NAME)) {
      userData.userName = line.substring(USER_NAME.length).trim();
    } else if (line.includes(PHONE_NUMBER)) {
      userData.phoneNumber = line.substring(PHONE_NUMBER.length).split(' ')[0].trim();
    } else if (line.includes(ORDER_PRODUCT_START)) {
      startLine = i + 1;
    } else if (line.includes(ORDER_PRODUCT_END)) {
      endLine = i;
    }
  }
  var orderProducts = [];
  for (var i = startLine; i < endLine; i++) {
    var line = lines[i];
    var parts = line.split('\t');
    if (parts.length < 2) {
      continue;
    }
    orderProducts.push(parts[1]);
  }
  userData.orderProducts = orderProducts;
  return userData;
}

function render() {
  var pages = document.getElementsByClassName('la-print-page');
  var userGiftValues = [];
  for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    page.style.position = 'relative';
    var order = page.getElementsByTagName('table')[0];
    order.style.transform = 'scale(1.1,1.1) rotate(90deg) translateX(-20px) translateY(-120px)';
    order.style.borderRight = '3px dotted black';

    var userData = getUserData(page.innerText);
    var phoneNumber = userData.phoneNumber;
    var name = userData.userName;
    var orderNumber = userData.orderNumber;
    var memberRenderInfo = getMemberRenderInfo(phoneNumber);

    // change order product
    var orderProducts = userData.orderProducts.map(function(orderProduct, index) {
      return (index + 1) + ') ' + orderProduct;
    });
    page.getElementsByClassName('order_item_table')[0].innerHTML = orderProducts.join('\t');
    page.getElementsByClassName('order_item_table')[0].parentNode.insertAdjacentHTML('beforeend', '<hr>');

    var html = TEMPLATES[memberRenderInfo.template]
      .replace('<table>', '<table style="width: 700px;height: 450px;position: absolute;top: 540px;transform: translateX(45px) translateY(20px);">')
      .replace('{name}', toCamelName(name))
      .replace('{member_rank}', RANKS[memberRenderInfo.ranking]);
    if (memberRenderInfo.template === 1) {
      if (userInfo[phoneNumber].user_gifts.length !== 0) {
        console.log('---------');
        console.log(userInfo[phoneNumber].user_gifts);
      }
      var orderedItemIds = getUserOrderedItemId(userInfo[phoneNumber]);
      var giftItemIds = userInfo[phoneNumber].user_gifts.map(function (gift) {
        return gift.SKU;
      });
      var gift = memberRenderInfo.ranking === 0 ? getLevel1Gift(orderedItemIds, giftItemIds) : getLevel2Gift(orderedItemIds, giftItemIds);
      html = html.replace('{gift_name}', gift.name)
        .replace('{gift_price}', gift.price)
        .replace('{gift_id}', gift.id)
        .replace('{greeting}', memberRenderInfo.greeting);

      userGiftValues.push(`('${userInfo[phoneNumber].user.PhoneNumber}',${orderNumber},'${gift.id}','${gift.price}','${new Date()}')`);
    }

    page.insertAdjacentHTML('beforeend', html);
  }
  console.log(products);
  addUserGift(userGiftValues.join(','));
}
