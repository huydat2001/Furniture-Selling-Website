const {
  getCart,
  addToCart,
  updateCart,
  removeFromCart,
  removeAllCart,
} = require("../../services/user/cart.service");

module.exports = {
  getCartAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const result = await getCart(userId);

      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },

  addToCartAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity, selectedColor } = req.body;
      const result = await addToCart(
        userId,
        productId,
        quantity,
        selectedColor
      );
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },

  updateCartAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const { productId, quantity } = req.body;
      const result = await updateCart(userId, productId, quantity);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },

  removeFromCartAPI: async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.productId;
      const result = await removeFromCart(userId, productId);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
  removeAllCartAPI: async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await removeAllCart(userId);
      return res.status(200).json({
        data: {
          statusCode: true,
          result: result,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 500,
          message: error.message,
        },
      });
    }
  },
};
