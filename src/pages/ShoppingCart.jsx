import React, { useEffect, useState } from "react";
import axios from "axios";

function ShoppingCart() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const baseUrl = "http://localhost:3000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodResponse, cartResponse] = await Promise.all([
          axios.get(`${baseUrl}/products`),
          axios.get(`${baseUrl}/cart`),
        ]);

        const productsWithQuantity = prodResponse.data.map((product) => ({
          ...product,
          quantity: product.quantity || 1,
        }));

        setProducts(productsWithQuantity);
        setCart(cartResponse.data);
        setLoading(false);
      } catch (error) {
        setError("Failed to fetch data");
        console.log(error);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleProductQuantity = (productId, change) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      product.quantity = Math.max(1, (product.quantity || 1) + change);
      setProducts([...products]);
    }
  };

  const addToCart = async (productId) => {
    try {
      const product = products.find((p) => p.id === productId);
      const quantityToAdd = product.quantity || 1;

      const existingCartItem = cart.find((item) => item.productId === productId);

      if (existingCartItem) {
        await axios.patch(`${baseUrl}/cart/${existingCartItem.id}`, {
          quantity: existingCartItem.quantity + quantityToAdd,
        });
      } else {
        await axios.post(`${baseUrl}/cart`, { productId, quantity: quantityToAdd });
      }

      product.quantity = 1;
      setProducts([...products]);

      const response = await axios.get(`${baseUrl}/cart`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  const removeFromCartByOne = async (cartItemId) => {
    try {
      const existingCartItem = cart.find((item) => item.id === cartItemId);

      if (existingCartItem) {
        if (existingCartItem.quantity > 1) {
          await axios.patch(`${baseUrl}/cart/${cartItemId}`, {
            quantity: existingCartItem.quantity - 1,
          });
        } else {
          await axios.delete(`${baseUrl}/cart/${cartItemId}`);
        }
      }

      const response = await axios.get(`${baseUrl}/cart`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to remove from cart", error);
    }
  };

  const addToCartByOne = async (cartItemId) => {
    try {
      const existingCartItem = cart.find((item) => item.id === cartItemId);

      if (existingCartItem) {
        await axios.patch(`${baseUrl}/cart/${cartItemId}`, {
          quantity: existingCartItem.quantity + 1,
        });
      }

      const response = await axios.get(`${baseUrl}/cart`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to add to cart", error);
    }
  };

  const clearCart = async () => {
    try {
      await Promise.all(
        cart.map((item) => axios.delete(`${baseUrl}/cart/${item.id}`))
      );
      setCart([]);
    } catch (error) {
      console.error("Failed to clear cart", error);
    }
  };

  const getTotal = () =>
    cart.reduce((total, item) => {
      const product = products.find((p) => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="container">
      <h1>Shopping Cart Demo</h1>

      <div className="products">
        <h2>Products</h2>
        {products.map((product) => (
          <div key={product.id} className="product">
            <span>
              {product.name} - ${product.price}
            </span>
            <div className="product-quantity-controls">
              <button onClick={() => handleProductQuantity(product.id, -1)}>-</button>
              <span style={{ margin: "0 12px" }}>{product.quantity || 1}</span>
              <button onClick={() => handleProductQuantity(product.id, 1)}>+</button>
              <button onClick={() => addToCart(product.id)} style={{ margin: "0 12px" }}>
                Add to Cart
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart">
        <h2>Cart</h2>
        <button onClick={clearCart} style={{ marginBottom: "8px" }}>
          Clear Cart
        </button>
        {cart.map((item) => {
          const product = products.find((p) => p.id === item.productId);
          return (
            <div key={item.id} className="cart-item" data-testid={`cart-item-${item.productId}`}>
              <span>
                {product?.name} - ${product?.price}
              </span>
              <div className="cart-item-quantity-controls">
                <button onClick={() => removeFromCartByOne(item.id)}>-</button>
                <span style={{ padding: "0 12px" }}>{item.quantity}</span>
                <button onClick={() => addToCartByOne(item.id)}>+</button>
              </div>
            </div>
          );
        })}
        <h3>Total: ${getTotal().toFixed(2)}</h3>
      </div>
    </div>
  );
}

export default ShoppingCart;