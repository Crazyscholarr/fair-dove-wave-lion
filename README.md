# Orbit

Bàn điều khiển profile trình duyệt, kiểu GPM Login. Tạo profile không giới hạn, gắn proxy, nạp extension, và đăng nhập nhiều ví từ một kho trên máy bạn.

Giao diện tiếng Việt. Dữ liệu nằm trong trình duyệt (localStorage), không cần tài khoản hay database.

## Làm được gì

- **Profile.** Tạo từng cái hoặc theo lô (tối đa 100 mỗi lần, tạo tiếp bao nhiêu cũng được). Mỗi profile có hệ điều hành, vân tay (user-agent, màn hình, múi giờ, WebGL, canvas), ghi chú và nhóm.
- **Proxy.** HTTP hoặc SOCKS5. Dán hàng loạt `host:port:user:pass` hoặc `socks5://user:pass@host:port`, rồi kiểm tra sống/chết.
- **Extension.** Thư viện MetaMask, Rabby, Phantom, Keplr, OKX, hoặc dán ID Chrome Web Store. Có thể ghi tên gói `.zip` / `.crx` vào thư viện.
- **Ví.** Dán không giới hạn cụm từ (12/15/18/21/24 từ) hoặc private key hex, mỗi dòng một ví. Có thể ghi nhãn: `Tên ví | cụm từ`. Ví EVM được suy ra địa chỉ. Gán vòng cho các profile đang chọn.
- **Kho mã hoá.** Đặt mật khẩu (tối thiểu 6 ký tự) để mã hoá ví bằng AES-GCM ngay trên máy. Có thể khoá, mở khoá, hoặc tải file kho đã mã hoá. Bí mật không được ghi vào nhật ký hàng đợi.
- **Hàng đợi.** Chọn profile rồi chạy lần lượt: mở profile, gắn proxy, nạp extension, nạp ví, mở khoá. Chạy song song 1–5 profile. Proxy đang chết sẽ làm phiên đó lỗi.

## Giới hạn

Đây là bàn điều khiển trên web, không phải app desktop. Hàng đợi chạy các bước và ghi nhật ký trong trang. Nó không mở Chromium thật và không gõ seed vào MetaMask trên máy bạn.

## Chạy trên máy local

Cần [Node.js 22](https://nodejs.org/) trở lên.

```bash
npm install
npm run dev
```

Mở [http://localhost:8080](http://localhost:8080).

## Cách dùng

1. Vào **Ví**, bấm **Nhập ví**. Mỗi dòng một cụm từ hoặc private key, rồi chọn cách gán vào profile.
2. Vào **Proxy** nếu cần, dán danh sách rồi bấm **Kiểm tra**.
3. Vào **Extension**, thêm ví hoặc gói cần nạp, rồi gắn vào từng profile ở cột bên phải.
4. Ở **Profile**, tick những profile cần chạy và bấm **Chạy**. Hoặc mở một profile và bấm **Đăng nhập ví**.
5. Sang **Hàng đợi** để xem nhật ký. **Dừng** để cắt giữa chừng. Thanh **Song song** chỉnh số profile chạy cùng lúc.

Profile mẫu `US-05` đang gắn một proxy chết, dùng để thử nhánh lỗi của hàng đợi.

## Dữ liệu ở đâu

Mọi thứ lưu trong trình duyệt, khoá `orbit.console.v1`. Xoá dữ liệu trang là mất profile và ví. Nếu đã đặt mật khẩu kho, bản lưu không còn chữ thường của cụm từ hay private key. Không có máy chủ nào nhận bí mật đó.
