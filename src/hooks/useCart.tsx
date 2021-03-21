import { createContext, ReactNode, useContext, useState } from "react";
import { toast } from "react-toastify";
import { api } from "../services/api";
import { Product, Stock } from "../types";

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartKey = "@RocketShoes:cart";
const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem(CartKey);
    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {
      const product = cart.find((p) => p.id === productId);
      if (!product) {
        const { data } = await api.get<Product>(
          `products/${productId}`
        );
        const newProduct = { ...data, amount: 1 };
        const newCart = [newProduct, ...cart.filter((p) => p.id !== productId)];

        setCart(newCart);
        updateStorage(newCart);
      } else {
        const newAmount = product.amount + 1;
        await updateProductAmount({ productId, amount: newAmount });
      }
    } catch(err) {
      toast.error("Erro na adição do produto");
    }
  };

  const removeProduct = (productId: number) => {
    try {
      const product = cart.find((p) => p.id === productId);
      if (!product)
        throw new Error("Erro na remoção do produto");
      const newCart = cart.filter((p) => p.id !== productId);

      setCart(newCart);
      updateStorage(newCart);
    } catch(err) {
      toast.error(err.message);
    }
  };

  const updateProductAmount = async ({
    productId,
    amount
  }: UpdateProductAmount) => {
    try {
      const product = cart.find((p) => p.id === productId);
      if (amount <= 0)
        return;
      if(!product)
        throw new Error("Erro na alteração de quantidade do produto");

      const { data } = await api.get(`stock/${productId}`);

      if (amount > data.amount)
        throw new Error("Quantidade solicitada fora de estoque");
      const baseCart = cart.filter((p) => p.id !== productId);
      const newProduct = { ...product, amount: amount };
      const newCart = [...baseCart, newProduct];

      setCart(newCart);
      updateStorage(newCart);
    } catch(err) {
      if(err.message === "Request failed with status code 404")
        toast.error("Erro na alteração de quantidade do produto")
      toast.error(err.message);
    }
  };

  const updateStorage = (newCart: Product[]) =>
    localStorage.setItem(CartKey, JSON.stringify(newCart));

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
