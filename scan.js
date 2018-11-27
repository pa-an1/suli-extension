var table = document.getElementsByClassName('next-table-body')[0]
var rows = table.getElementsByClassName('next-table-row')

var result = [];
for (var i = 0;i < rows.length; i++){
  var tds = rows[i].getElementsByTagName('td');
  var id = tds[1].innerText.trim();
  var name = tds[0].innerText.trim();
  var price = parseInt(tds[4].innerText.trim().replace(',', ''), 10);
  var quantity = parseInt(tds[5].innerText.trim(), 10);
  result.push({ id, name, price, quantity });
}

chrome.storage.sync.set({products: result}, function() {
  document.body.prepend('Success: ' + result.length + ' imported\n');
});