const puppeteer = require("puppeteer");
const delay = require("./utils/Delay");
const Create_url =
  "https://account.mihoyo.com/#/register/email?cb_route=%2Faccount%2FsafetySettings";
const Email_url = "https://10minemail.com/vi/";
const Profile_url = "https://account.mihoyo.com/#/account/safetySettings";

const create_function = (username) => {
  (async () => {
    //
    //  CREATE
    //

    // Go to 10Mine.com
    console.log("1. Khoi tao");
    const checkTimeout = setTimeout(() => {
      console.log("End. Không thể khởi tạo Browser");
      browser.close();
    }, 30000);
    const browser = await puppeteer.launch({ headless: true, pipe: true });
    if (!browser) {
      console.log("End. Không thể khởi tạo Browser");
      await browser.close();
    }
    clearTimeout(checkTimeout);
    try {
      const Create_Page = await browser.newPage();

      // Get email from the 10mine.com
      console.log("2. Truy cap vao web và lấy email");
      await Create_Page.goto(Email_url);
      const dimension = await Create_Page.evaluate(() => {
        let data = document.querySelector("#mail");
        return data.value;
      });
      console.log(`3. Email đăng ký tài khoản hiện tại là ${dimension}`);

      // Send code to Email page
      console.log("4. Gửi thông báo đến máy chủ mihoyo account");
      await Create_Page.goto(Create_url);
      await Create_Page.type('input[placeholder="Email"]', dimension);
      await Create_Page.click(".input-inner-btn");

      // Give Token then fill the input
      console.log("5. Truy cập vào Email và chờ lấy két quả");
      await Create_Page.goto(Email_url);
      await Create_Page.click(".temp-emailbox-text");
      await delay(20000);

      const Create_Token = await Create_Page.evaluate(() => {
        let data = document.querySelectorAll(".inboxSubject.subject-title");
        let Token = data[3].textContent.match(/\d{6}/g)[0];
        return Token;
      });
      console.log(`6. Mã token hiện tại là ${Create_Token}`);

      // Fill default values
      console.log("7. Tiến hành tạo tài khoản");
      await Create_Page.goto(Create_url);
      await Create_Page.type('[placeholder="Email"]', dimension);
      await Create_Page.type('input[type="password"]', "123456");
      await Create_Page.type(
        'input[placeholder="Xác Nhận Mật Khẩu"]',
        "123456"
      );
      await Create_Page.click(".mhy-icon.iconfont.iconNotselected");
      await Create_Page.type('[placeholder="Mã Xác Nhận"]', Create_Token);
      await Create_Page.click(".default-btn.lg-btn");

      console.log("8. Đã tạo tài khoản thành công");
    } catch (error) {
      console.log("End. Server lỗi vui lòng thử lại");
      await browser.close();
      return 1;
    }
    //
    //  UPDATE
    //
    try {
      console.log("9. Gửi thông tin xác nhận tạo username");
      const Update_Page = await browser.newPage();
      await Update_Page.goto(Profile_url);
      await delay(1000);
      // await Update_Page.click(".default-btn.sm-btn.is-ghost");
      await Update_Page.evaluate(() => {
        let data = document.querySelectorAll("button");
        data[0].click();
      });

      await delay(1000);
      await Update_Page.click(".input-inner-btn");
      console.log("10. Đã gửi mã thành công");
      // await Update_Page.goto(Email_url);

      console.log("11. Đến Email và chờ token");
      const Update_Email_02 = await browser.newPage();
      await Update_Email_02.goto(Email_url);
      await Update_Email_02.click(".temp-emailbox-text");
      await delay(20000);
      const Update_token = await Update_Email_02.evaluate(() => {
        let data = document.querySelectorAll(".inboxSubject.subject-title");
        let Token = data[3].textContent.match(/\d{6}/g)[0];
        return Token;
      });
      console.log(`12. Token đã lấy là ${Update_token}`);

      // Back to Profile and fill Token to input form
      console.log("13. Tiến hành đến trang Account Mihoyo");
      await Update_Email_02.goto(Profile_url);
      await delay(1000);
      await Update_Email_02.click(".default-btn.sm-btn.is-ghost");
      await Update_Email_02.waitForSelector(".verify-ways-title");
      await Update_Email_02.type('input[type="text"]', Update_token);
      await Update_Email_02.click(".default-btn.lg-btn");

      await Update_Email_02.waitForSelector(".mhy-message-box-mask.vi-vn");
      await delay(500);

      // Change username
      await Update_Email_02.type(
        'input[placeholder="Tên Người Dùng (6~15 ký tự, ký tự đầu tiên là chữ cái)"]',
        username
      );
      await Update_Email_02.type(
        'input[placeholder="Xác Nhận Tên Người Dùng"]',
        username
      );
      await Update_Email_02.click(".default-btn.lg-btn");
      console.log("14. Kiểm tra tên người dùng");
      // Check
      await delay(1000);
      const check = await Update_Email_02.evaluate(() => {
        let data = document.querySelector(".default-btn.lg-btn");
        if (data == null) {
          return 0;
        }
        return 1;
      });

      if (check == 1) {
        console.log("End. Tên người dùng đã tồn tại");
        await browser.close();
        return 1;
      }
      console.log("16. Tiến hành hủy Email liên kết");
      await delay(1000);
      await Update_Email_02.evaluate(() => {
        let data = document.querySelectorAll("button");
        data[1].click();
      });
      await Update_Email_02.waitForSelector(".mhy-verification");
      await Update_Email_02.click(".input-inner-btn");

      // UnLink
      console.log("17. Đến Email và nhận token");
      const Unlink_Email = await browser.newPage();
      await Unlink_Email.goto(Email_url);
      await Unlink_Email.click(".temp-emailbox-text");
      await delay(20000);
      const Unlink_Token = await Unlink_Email.evaluate(() => {
        let data = document.querySelectorAll(".inboxSubject.subject-title");
        let Token = data[3].textContent.match(/\d{6}/g)[0];
        return Token;
      });
      console.log(`18. Token nhận được là ${Unlink_Token}`);

      console.log("19. Tiến hành hủy liên kết Email");
      await Unlink_Email.goto(Profile_url);
      await delay(1000);
      await Unlink_Email.evaluate(() => {
        let data = document.querySelectorAll("button");
        data[1].click();
      });

      await Unlink_Email.waitForSelector(".verify-ways-title");
      await Unlink_Email.type('input[type="text"]', Unlink_Token);
      await Unlink_Email.click(".default-btn.lg-btn");
      console.log("20. Hủy thành công");

      await delay(1000);
      const View_Profile = await browser.newPage();
      await View_Profile.goto(Profile_url);
      console.log(`Tài khoản: ${username} có mật khẩu là 123456`);
      console.log(`End. Tài khoản đăng ký thành công`);
      await browser.close();
      return 0;
    } catch (error) {
      console.log("End. Server lỗi");
      await browser.close();
      return 1;
    }
  })();
};

module.exports = create_function;
