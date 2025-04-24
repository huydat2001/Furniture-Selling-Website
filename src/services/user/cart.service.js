const Cart = require("../../models/cart");

module.exports = {
  getCart: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId }).populate({
        path: "items.product",
        select: "name price decreases images color",
      });
      return cart;
    } catch (error) {
      throw new Error("Lỗi truy vấn dữ liệu: " + error.message);
    }
  },

  addToCart: async (userId, productId, quantity, selectedColor) => {
    try {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingItem = cart.items.find(
        (item) =>
          item.product.toString() === productId &&
          item.selectedColor === selectedColor
      );

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.items.push({ product: productId, quantity, selectedColor });
      }

      await cart.save();
      await cart.populate({
        path: "items.product",
        select: "name price discountedPrice image color",
      });
      return cart;
    } catch (error) {
      throw new Error("Lỗi khi thêm vào giỏ hàng: " + error.message);
    }
  },

  updateCart: async (userId, productId, quantity) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error("Giỏ hàng không tồn tại");
      }

      const item = cart.items.find(
        (item) => item.product.toString() === productId
      );
      if (!item) {
        throw new Error("Sản phẩm không có trong giỏ hàng");
      }

      item.quantity = quantity;
      await cart.save();
      await cart.populate({
        path: "items.product",
        select: "name price discountedPrice image color",
      });
      return cart;
    } catch (error) {
      throw new Error("Lỗi khi cập nhật giỏ hàng: " + error.message);
    }
  },

  removeFromCart: async (userId, productId) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error("Giỏ hàng không tồn tại");
      }

      cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
      );
      await cart.save();
      await cart.populate({
        path: "items.product",
        select: "name price discountedPrice image color",
      });
      return cart;
    } catch (error) {
      throw new Error("Lỗi khi xóa sản phẩm: " + error.message);
    }
  },
  removeAllCart: async (userId) => {
    try {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        throw new Error("Giỏ hàng không tồn tại");
      }

      const result = await Cart.deleteMany({ _id: cart._id });
      return result;
    } catch (error) {}
  },
};
