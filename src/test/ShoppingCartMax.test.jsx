import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ShoppingCart from "../pages/ShoppingCart";
import axios from "axios";

vi.mock("axios");

describe("ShoppingCart Total Price Tests", () => {
  const mockProducts = [
    { id: "1", name: "Laptop", price: 1000, maxQuantity: 5 }, // Thêm maxQuantity
    { id: "2", name: "Mouse", price: 50, maxQuantity: 5 },
    { id: "3", name: "Keyboard", price: 80, maxQuantity: 5 }
  ];

  const baseUrl = "http://localhost:3000";

  beforeEach(() => {
    axios.get.mockClear();
    axios.post.mockClear();
    axios.patch.mockClear();
    axios.delete.mockClear();
  });

  it("updates total price with single product and verifies POST payload", async () => {
    axios.get
      .mockResolvedValueOnce({ data: mockProducts })
      .mockResolvedValueOnce({ data: [] });

    render(<ShoppingCart />);
    await waitFor(() => expect(screen.getByText(/Laptop - \$1000/)).toBeInTheDocument());

    const postSpy = vi.spyOn(axios, "post");
    axios.post.mockImplementationOnce(async (url, data) => ({
      data: { id: "d779", productId: data.productId, quantity: data.quantity },
    }));
    axios.get.mockResolvedValueOnce(() => ({
      data: [{ id: "d779", productId: postSpy.mock.calls[0][1].productId, quantity: postSpy.mock.calls[0][1].quantity }],
    }));

    const addButtons = screen.getAllByText("Add to Cart");
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith(`${baseUrl}/cart`, { productId: "1", quantity: 1 }, expect.any(Object));
      expect(screen.getByText("Total: $1000.00")).toBeInTheDocument();
    }, { timeout: 2000 });
    postSpy.mockRestore();
  });

  it("detects exceeding max quantity when adding existing product", async () => {
    axios.get
      .mockResolvedValueOnce({ data: mockProducts })
      .mockResolvedValueOnce({ data: [] });

    render(<ShoppingCart />);
    await waitFor(() => expect(screen.getByText(/Laptop - \$1000/)).toBeInTheDocument());

    const addButtons = screen.getAllByText("Add to Cart");
    const postSpy = vi.spyOn(axios, "post");
    const patchSpy = vi.spyOn(axios, "patch");

    // Thêm lần đầu: quantity = 1
    axios.post.mockImplementationOnce(async (url, data) => ({
      data: { id: "d779", productId: data.productId, quantity: data.quantity },
    }));
    axios.get.mockResolvedValueOnce(() => ({
      data: [{ id: "d779", productId: postSpy.mock.calls[0][1].productId, quantity: postSpy.mock.calls[0][1].quantity }],
    }));
    fireEvent.click(addButtons[0]);

    await waitFor(() => expect(screen.getByText("Total: $1000.00")).toBeInTheDocument());

    // Thêm lần 2: quantity = 1 + 2 = 3
    axios.patch.mockImplementationOnce(async (url, data) => ({
      data: { id: "d779", productId: "1", quantity: data.quantity },
    }));
    axios.get.mockResolvedValueOnce(() => ({
      data: [{ id: "d779", productId: "1", quantity: patchSpy.mock.calls[0][1].quantity }],
    }));
    fireEvent.click(addButtons[0]);

    await waitFor(() => expect(screen.getByText("Total: $3000.00")).toBeInTheDocument());

    // Thêm lần 3: quantity = 3 + 2 = 5 (đạt maxQuantity)
    axios.patch.mockImplementationOnce(async (url, data) => ({
      data: { id: "d779", productId: "1", quantity: data.quantity },
    }));
    axios.get.mockResolvedValueOnce(() => ({
      data: [{ id: "d779", productId: "1", quantity: patchSpy.mock.calls[1][1].quantity }],
    }));
    fireEvent.click(addButtons[0]);

    await waitFor(() => expect(screen.getByText("Total: $5000.00")).toBeInTheDocument());

    // Thêm lần 4: quantity = 5 + 2 = 7 (vượt maxQuantity)
    axios.patch.mockImplementationOnce(async (url, data) => ({
      data: { id: "d779", productId: "1", quantity: data.quantity },
    }));
    axios.get.mockResolvedValueOnce(() => ({
      data: [{ id: "d779", productId: "1", quantity: patchSpy.mock.calls[2][1].quantity }],
    }));
    fireEvent.click(addButtons[0]);

    await waitFor(() => {
      expect(patchSpy).toHaveBeenLastCalledWith(
        `${baseUrl}/cart/d779`,
        { quantity: 7 }, // Payload gửi đi là 7, vượt maxQuantity 5
        expect.any(Object)
      );
      expect(screen.getByText("Total: $7000.00")).toBeInTheDocument(); // Tổng tiền sai thực tế
      // Test sẽ thất bại nếu không giới hạn quantity <= maxQuantity
    }, { timeout: 2000 });

    postSpy.mockRestore();
    patchSpy.mockRestore();
  });
});