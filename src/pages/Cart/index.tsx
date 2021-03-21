import React from "react";
import {
  MdDelete,
  MdAddCircleOutline,
  MdRemoveCircleOutline
} from "react-icons/md";

import { useCart } from "../../hooks/useCart";
import { formatPrice } from "../../util/format";
import { Container, ProductTable, Total } from "./styles";

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
  amount: number;
}

interface CartItemFormatted extends Product {
  priceFormatted: string;
  subTotal: string;
}

const Cart = (): JSX.Element => {
  const { cart, removeProduct, updateProductAmount } = useCart();
  const cartFormatted = cart.map((product) => {
    return {
      ...product,
      priceFormatted: formatPrice(product.price),
      subTotal: formatPrice(product.price * product.amount)
    } as CartItemFormatted;
  });
  const total = formatPrice(
    cart.reduce((sumTotal, product) => {
      sumTotal = sumTotal + product.amount * product.price;
      return sumTotal;
    }, 0)
  );

  function handleProductIncrement(productId: number) {
    const product = cart.find((p) => p.id === productId);
    if (!product) return;

    const newAmount = product.amount + 1;
    updateProductAmount({ productId, amount: newAmount });
  }

  function handleProductDecrement(productId: number) {
    const product = cart.find((p) => p.id === productId);
    if (!product) return;

    const newAmount = product.amount - 1;
    updateProductAmount({ productId, amount: newAmount });
  }

  function handleRemoveProduct(productId: number) {
    removeProduct(productId);
  }

  return (
    <Container>
      <ProductTable>
        <thead>
          <tr>
            <th aria-label="product image" />
            <th>PRODUTO</th>
            <th>QTD</th>
            <th>SUBTOTAL</th>
            <th aria-label="delete icon" />
          </tr>
        </thead>
        <tbody>
          {cartFormatted.map((p) => {
            return (
              <tr data-testid="product" key={p.id}>
                <td>
                  <img
                    src={p.image}
                    alt="Tênis de Caminhada Leve Confortável"
                  />
                </td>
                <td>
                  <strong>{p.title}</strong>
                  <span>{p.priceFormatted}</span>
                </td>
                <td>
                  <div>
                    <button
                      type="button"
                      data-testid="decrement-product"
                      disabled={p.amount <= 1}
                      onClick={() => handleProductDecrement(p.id)}
                    >
                      <MdRemoveCircleOutline size={20} />
                    </button>
                    <input
                      type="text"
                      data-testid="product-amount"
                      readOnly
                      value={p.amount}
                    />
                    <button
                      type="button"
                      data-testid="increment-product"
                      onClick={() => handleProductIncrement(p.id)}
                    >
                      <MdAddCircleOutline size={20} />
                    </button>
                  </div>
                </td>
                <td>
                  <strong>{p.subTotal}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    data-testid="remove-product"
                    onClick={() => handleRemoveProduct(p.id)}
                  >
                    <MdDelete size={20} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </ProductTable>

      <footer>
        <button type="button">Finalizar pedido</button>

        <Total>
          <span>TOTAL</span>
          <strong>{total}</strong>
        </Total>
      </footer>
    </Container>
  );
};

export default Cart;
