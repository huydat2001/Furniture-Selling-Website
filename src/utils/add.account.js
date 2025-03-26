const Account = require("../models/account");
async function initializeDefaultAccounts() {
  try {
    const accountCount = await Account.countDocuments();

    if (accountCount === 0) {
      console.log("Chưa có tài khoản nào. Tạo tài khoản mặc định...");

      const adminAccount = new Account({
        username: "admin",
        email: "admin@example.com",
        password: "admin123",
        fullName: "Administrator",
        role: "admin",
        isVerified: true,
      });

      const customerAccount = new Account({
        username: "customer1",
        email: "customer1@example.com",
        password: "customer123",
        fullName: "Customer One",
        role: "customer",
        isVerified: true,
      });

      await Promise.all([adminAccount.save(), customerAccount.save()]);
      console.log("Đã tạo 2 tài khoản mặc định: admin và customer1");
    } else {
      console.log("Đã có tài khoản trong database, không cần tạo mới.");
    }
  } catch (error) {
    console.error("Lỗi khi khởi tạo tài khoản mặc định:", error);
  }
}

module.exports = { initializeDefaultAccounts };
