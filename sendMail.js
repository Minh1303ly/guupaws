const nodemailer = require("nodemailer");
require('dotenv').config();

// Create a transporter using Gmail SMTP
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: 'minhbqhe171754@fpt.edu.vn', // Your Gmail address
      pass: process.env.GG_MAIL     // App Password from Step 2
    }
  });

const from = '"GuuPawz Shop 🐶" <minhbqhe171754@fpt.edu.vn>';

function sendMail(to, subject, htmlContent){
    return transporter.sendMail({
    from: from,
    to: to,
    subject: subject,
    html: htmlContent
  });
}

async function sendOrderConfirmationEmail(order) {
  const { infor, total, date } = order;
  const items = JSON.parse(order.items);
  const itemListHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td align="center">${item.selectedSize}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">${item.price.toLocaleString()}đ</td>
    </tr>
  `).join("");

  const htmlContent = `
  <div style="font-family:'Segoe UI',sans-serif;color:#333;padding:20px;">
    <h2 style="color:#ff6b81;">🎉 Đặt hàng thành công!</h2>
    <p>Cảm ơn bạn <strong>${infor.fullName}</strong> đã mua hàng tại <strong>GuuPawz Fashion Shop</strong>!</p>
    <p>Chúng tôi đã nhận được đơn hàng của bạn với thông tin như sau:</p>

    <ul>     
      <li><strong>Điện thoại:</strong> ${infor.phone}</li>
      <li><strong>Email:</strong> ${infor.email}</li>
      <li>Địa chỉ:</strong> ${infor.cityName}, ${infor.districtName}, , ${infor.wardName}</li>
      <li><strong>Địa chỉ cụ thể:</strong> ${infor.address}</li>
      <li><strong>Ghi chú:</strong> ${infor.notes ?? "Không có ghi chú"}</li>
      <li><strong>Giao hàng:</strong> ${infor.shippingMethod == "standard" ? "Giao hàng nhanh" : "Giao hàng hỏa tốc"}</li>
      <li><strong>Thanh toán:</strong> ${infor.paymentMethod == "cashDelivered" ? "Thanh toán khi nhận hàng": "Thanh toán online"}</li>
      <li><strong>Ngày đặt:</strong> ${new Date(date).toLocaleString("vi-VN")}</li>
    </ul>

    <h3 style="color:#2196F3;">📦 Sản phẩm</h3>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead>
        <tr style="background-color:#f8f8f8;">
          <th align="left">Tên</th><th align="center">Size</th><th align="center">SL</th><th align="right">Giá</th>
        </tr>
      </thead>
      <tbody>${itemListHTML}</tbody>
      <tfoot>
        <tr style="background-color:#f1f1f1;">
          <td colspan="3" align="right"><strong>Tổng:</strong></td>
          <td align="right"><strong>${total.toLocaleString()}đ</strong></td>
        </tr>
      </tfoot>
    </table>

    <p style="margin-top:20px;">🧡 Một lần nữa xin chân thành cảm ơn bạn đã ủng hộ!</p>
    <p><em>- GuuPawz Fashion Team 🐾</em></p>
  </div>
  `;

  return sendMail(infor.email, "Xác nhận đơn hàng của bạn", htmlContent);
}

async function sendNewOrderToShop(order) {
  const { infor, total, date, id } = order;
  const items = JSON.parse(order.items);
  const itemListHTML = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td align="center">${item.selectedSize}</td>
      <td align="center">${item.quantity}</td>
      <td align="right">${item.price.toLocaleString()}đ</td>
    </tr>
  `).join("");

  const htmlContent = `
  <div style="font-family:'Segoe UI',sans-serif;color:#333;padding:20px;">
    <h2 style="color:#ff9800;">📢 Đơn hàng mới</h2>
    <p><strong>Mã đơn hàng:</strong> ${id}</p>
    <p><strong>Khách hàng:</strong> ${infor.fullName} - ${infor.phone}</p>
    <p><strong>Email:</strong> ${infor.email}</p>
    <p><strong>Địa chỉ:</strong> ${infor.cityName}, ${infor.districtName}, , ${infor.wardName}</p>
    <p><strong>Địa chỉ cụ thể:</strong> ${infor.address}</p>
    <p><strong>Ghi chú:</strong> ${infor.notes ?? "Không có ghi chú"}</p>

    <ul>
      <li><strong>Giao hàng:</strong> ${infor.shippingMethod == "standard" ? "Giao hàng nhanh" : "Giao hàng hỏa tốc"}</li>
      <li><strong>Thanh toán:</strong> ${infor.paymentMethod == "cashDelivered" ? "Thanh toán khi nhận hàng": "Thanh toán online"}</li>
      <li><strong>Ngày đặt:</strong> ${new Date(date).toLocaleString("vi-VN")}</li>
    </ul>

    <h3>📦 Sản phẩm:</h3>
    <table style="width:100%;border-collapse:collapse;margin-top:10px;">
      <thead>
        <tr style="background-color:#f8f8f8;">
          <th align="left">Tên</th><th align="center">Size</th><th align="center">SL</th><th align="right">Giá</th>
        </tr>
      </thead>
      <tbody>${itemListHTML}</tbody>
      <tfoot>
        <tr style="background-color:#f1f1f1;">
          <td colspan="3" align="right"><strong>Tổng:</strong></td>
          <td align="right"><strong>${total.toLocaleString()}đ</strong></td>
        </tr>
      </tfoot>
    </table>
    <p><strong>Tổng:</strong> ${total.toLocaleString()}đ</p>
  </div>
  `;

  return sendMail(infor.email, "Đơn hàng mới từ khách hàng", htmlContent);
}

module.exports = { sendOrderConfirmationEmail, sendNewOrderToShop };
