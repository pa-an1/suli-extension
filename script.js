var thank_html = `
<table style="
  margin-top: -310px;
  bottom: -270px;
  width: 700px;
  height: 450px;
  padding-right: 40px;
  padding-left: 40px;
">
  <col width="50%">
  <col width="50%">
  <tr style="border-left: 30px solid #fff;border-right: 30px solid #fff;">
    <td colspan="2" style="border: 0px solid #fff;">
      <table style="width:100%">
        <col width="15%">
        <col width="85%">
        <tr>
          <td style="border: 0px solid #fff;">
            <img src="https://lazada-suli.herokuapp.com/static/suli-logo.jpg"
              width="80px"
              height="80px"
            />
          </td>
          <td style="border: 0px solid #fff;text-align: center">
            <span style="color:blue;font-size:20px;"><u>lazada.vn/suli-clothing</u></span><br/>
            <span style="font-size:25px;"><b>🛍️Suli Clothing 📞0965193744</b></span>
          </td>
        </tr>
      </table>
    </td>
  </tr>
  <tr style="border-left: 30px solid #fff;border-right: 30px solid #fff;font-size: 15px;text-align: left;">
    <td colspan="2" style="border: 0px solid #fff;border-right: 10px solid #fff;">
      "Rất cảm ơn <b>{name}</b> đã chọn mua sản phẩm của shop Suli Clothing 🛍️<br/>
      Shop rất mong được phục vụ bạn những lần tiếp theo.<br/>
      <br/>
      <table style="width:100%">
        <col width="55%">
        <col width="20%">
        <col width="25%">
        <tr>
          <td style="border: 0px solid #fff;">
            Để cám ơn sự tin tưởng của bạn dành cho Shop<br>
            Shop sẽ gửi tặng bạn <b>1 "Bông Tai Cánh Hoa - Phong Cách Nhật Bản"</b> trị giá <b>19.000VND</b> cho lần mua hàng tiếp theo tại Suli Clothing<br/><em>(bất kể giá trị của đơn hàng).</em>
          </td>
          <td style="border: 0px solid #fff;">
            <img src="https://lazada-suli.herokuapp.com/static/gift2.jpg"
              width="150px"
              height="150px"
            />
          </td>
          <td style="border: 0px solid #fff;text-align: left;font-size: 13px;border-left: 10px solid #fff;">
            <ul>
              <li><em>- Bông tai được thiết kế tinh xảo.</em></li>
              <li><em>- Chất lượng tốt, bền đẹp. </em></li>
              <li><em>- Được làm bằng hợp kim cao cấp, không gỉ.</em></li>
            </ul>
          </td>
        </tr>
      </table>
      <table style="width:100%">
        <col width="15%">
        <col width="85%">
        <tr style="border: 0px solid #ddd;">
          <td style="border: 0px solid #fff;text-align: right;font-size: 13px;">
            <em><b>Lưu ý: </b></em>
          </td>
          <td style="border: 0px solid #fff;border-left: 10px solid #fff;text-align: left;font-size: 13px;">
            <em>- Quà tặng chỉ áp dụng khi bạn mua hàng bằng tài khoản Lazada của đơn hàng lần này.<br/>
            - Quà tặng sẽ được gửi kèm theo đơn hàng tiếp theo của bạn.</em>
          </td>
        </tr>
      </table>
      <br/>
      - Nếu hài lòng với sản phẩm bạn hãy đánh giá 5 sao cho sản phẩm.<br/>
      - Nếu sản phẩm lỗi hoặc sai hình, bạn hãy chat ngay với shop trên Lazada hoặc gọi điện thoại trực tiếp tới 📞0965193744. Shop sẽ đổi hàng mới hoặc hoàn tiền cho bạn.<br/>
      💝💝💝 Cám ơn bạn rất nhiều ạ. Chúc bạn có một ngày thật vui vẻ 💝💝💝
    </td>
  </tr>
</table>
`;

var userInfo = {};
var numberOfPage = 0;
function getInfo(phoneNumber) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            userInfo[phoneNumber] =  JSON.parse(xhttp.responseText);
            checkGetInfoIsDone();
            console.log(userInfo[phoneNumber])
        }
    };
    xhttp.open("GET", "https://lazada-suli.herokuapp.com/user/" + phoneNumber, true);
    xhttp.send();
}

var pages = document.getElementsByClassName('la-print-page');
numberOfPage = pages.length;
for (var i = 0; i < pages.length; i++) {
    var page = pages[i];
    var phoneNumber = page.querySelectorAll('#phone')[1].textContent.trim();
    console.log(phoneNumber)
    getInfo(phoneNumber)
}

var countRequestDone = 0;
function checkGetInfoIsDone() {
    countRequestDone++;
    if (countRequestDone == numberOfPage) {
        render();
    }
}

function render() {
    for (var i = 0; i < pages.length; i++) {
        var page = pages[i];
        var order = page.getElementsByTagName('table')[0];
        order.style.transform = 'scale(0.7,0.7) rotate(90deg) translateX(-220px)';

        var phoneNumber = page.querySelectorAll('#phone')[1].textContent.trim();
        
        var name = page.getElementsByTagName('tr')[6].getElementsByTagName('span')[0].textContent;
        var html = thank_html.replace('{name}', toCamelName(name));

        page.insertAdjacentHTML('beforeend', html);
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