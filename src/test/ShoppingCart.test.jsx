// import { describe, it, expect, vi, beforeEach } from "vitest";
// import { render, screen, fireEvent, waitFor } from "@testing-library/react";
// import ShoppingCart from "../pages/ShoppingCart";
// import axios from "axios";

// vi.mock("axios");

// describe("ShoppingCart Total Price Tests", () => {
//   const mockProducts = [
//     { id: "1", name: "Laptop", price: 2000 },
//     { id: "2", name: "Mouse", price: 50 },
//     { id: "3", name: "Keyboard", price: 80 }
//   ];

//   beforeEach(() => {
//     axios.get.mockClear();
//     axios.post.mockClear();
//     axios.patch.mockClear();
//     axios.delete.mockClear();
//   });

//   it("updates total price with single product", async () => {
//     axios.get
//       .mockResolvedValueOnce({ data: mockProducts })
//       .mockResolvedValueOnce({ data: [] });

//     render(<ShoppingCart />);

//     await waitFor(() => {
//       expect(screen.getByText(/Laptop - \$2000/)).toBeInTheDocument();
//     });

//     axios.post.mockResolvedValueOnce({ 
//       data: { id: "d779", productId: "1", quantity: 1 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [{ id: "d779", productId: "1", quantity: 1 }]
//     });
//     const addButtons = screen.getAllByText("Add to Cart");
//     fireEvent.click(addButtons[0]);

//     await waitFor(() => {
//       expect(screen.getByText("Total: $2000.00")).toBeInTheDocument();
//     }, { timeout: 2000 });
//   });

//   it("updates total price with multiple products", async () => {
//     axios.get
//       .mockResolvedValueOnce({ data: mockProducts })
//       .mockResolvedValueOnce({ data: [] });

//     render(<ShoppingCart />);

//     await waitFor(() => {
//       expect(screen.getByText(/Laptop - \$2000/)).toBeInTheDocument();
//     });

//     const addButtons = screen.getAllByText("Add to Cart");

//     // Add Laptop
//     axios.post.mockResolvedValueOnce({ 
//       data: { id: "d779", productId: "1", quantity: 1 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [{ id: "d779", productId: "1", quantity: 1 }]
//     });
//     fireEvent.click(addButtons[0]);

//     // Add Mouse
//     axios.post.mockResolvedValueOnce({ 
//       data: { id: "d780", productId: "2", quantity: 1 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [
//         { id: "d779", productId: "1", quantity: 1 },
//         { id: "d780", productId: "2", quantity: 1 }
//       ]
//     });
//     fireEvent.click(addButtons[1]);

//     await waitFor(() => {
//       expect(screen.getByText("Total: $2050.00")).toBeInTheDocument();
//     }, { timeout: 2000 });
//   });

//   it("handles maximum quantity boundary (e.g., 100 items)", async () => {
//     axios.get
//       .mockResolvedValueOnce({ data: mockProducts })
//       .mockResolvedValueOnce({ data: [] });

//     render(<ShoppingCart />);

//     await waitFor(() => {
//       expect(screen.getByText(/Mouse - \$50/)).toBeInTheDocument();
//     });

//     const addButtons = screen.getAllByText("Add to Cart");

//     // Add Mouse with maximum quantity
//     axios.post.mockResolvedValueOnce({ 
//       data: { id: "d780", productId: "2", quantity: 100 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [{ id: "d780", productId: "2", quantity: 100 }]
//     });
//     // Simulate setting quantity to 100 before adding
//     const increaseButtons = screen.getAllByText("+");
//     for (let i = 0; i < 99; i++) {
//       fireEvent.click(increaseButtons[1]); // Mouse is second item
//     }
//     fireEvent.click(addButtons[1]);

//     await waitFor(() => {
//       expect(screen.getByText("Total: $5000.00")).toBeInTheDocument();
//     }, { timeout: 2000 });
//   });

//   it("handles zero quantity edge case", async () => {
//     axios.get
//       .mockResolvedValueOnce({ data: mockProducts })
//       .mockResolvedValueOnce({ data: [] });

//     render(<ShoppingCart />);

//     await waitFor(() => {
//       expect(screen.getByText(/Laptop - \$2000/)).toBeInTheDocument();
//     });

//     // Initial total should be zero
//     expect(screen.getByText("Total: $0.00")).toBeInTheDocument();
//   });

//   it("updates total price with multiple instances of same product", async () => {
//     axios.get
//       .mockResolvedValueOnce({ data: mockProducts })
//       .mockResolvedValueOnce({ data: [] });

//     render(<ShoppingCart />);

//     await waitFor(() => {
//       expect(screen.getByText(/Laptop - \$2000/)).toBeInTheDocument();
//     });

//     const addButtons = screen.getAllByText("Add to Cart");

//     // Add Laptop once
//     axios.post.mockResolvedValueOnce({ 
//       data: { id: "d779", productId: "1", quantity: 1 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [{ id: "d779", productId: "1", quantity: 1 }]
//     });
//     fireEvent.click(addButtons[0]);

//     await waitFor(() => {
//       expect(screen.getByText("Total: $2000.00")).toBeInTheDocument();
//     });

//     // Add Laptop again (should update existing item)
//     axios.patch.mockResolvedValueOnce({ 
//       data: { id: "d779", productId: "1", quantity: 2 } 
//     });
//     axios.get.mockResolvedValueOnce({
//       data: [{ id: "d779", productId: "1", quantity: 2 }]
//     });
//     fireEvent.click(addButtons[0]);

//     await waitFor(() => {
//       expect(screen.getByText("Total: $2000.00")).toBeInTheDocument();
//     }, { timeout: 2000 });
//   });
// });