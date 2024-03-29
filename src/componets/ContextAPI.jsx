import React, { Component } from 'react'
// import data from data.js
import { storeProducts, detailProduct } from '../data.js'

// in oder to work with Context API, we need to create a new context object
const ProductContext = React.createContext()
// Whenever we create context object it comes with two components
// Provider provides information for all the application and sits on top of the application
// Consumer (we dont need to pass props)

class ProductProvider extends Component {
  state = {
    products: [],
    detailProduct: detailProduct,
    cart: [],
    modalOpen: false,
    modalProduct: detailProduct,
    cartSubTotal: 0,
    cartTax: 0,
    cartTotal: 0
  };

  // fresh set of values instead of copying them
  componentDidMount() {
    this.setProducts();
  }

  // copying the value of the products not referencing them
  setProducts = () => {
    let tempProducts = [];
    storeProducts.forEach(item => {
      const singleItem = { ...item };
      tempProducts = [...tempProducts, singleItem];
    });
    this.setState(() => {
      return { products: tempProducts };
    });
  };

  // get Item by ID
  getItem = id => {
    const product = this.state.products.find(item => item.id === id);
    return product;
  };

  // connecting detailed Product with product
  handleDetail = id => {
    const product = this.getItem(id);
    this.setState(() => {
      return { detailProduct: product };
    });
  };

  // use index to target the product otherwise the displayed product will move to the end
  addToCart = id => {
    let tempProducts = [...this.state.products];
    const index = tempProducts.indexOf(this.getItem(id));
    const product = tempProducts[index];
    product.inCart = true;
    product.count = 1;
    const price = product.price;
    product.total = price;

    this.setState(
      () => {
        return {
          products: tempProducts,
          cart: [...this.state.cart, product]
        };
      },
      () => {
        // callback function to change the value when added to cart
        this.addTotals()
      }
    );
  };

  // open modal
  openModal = id => {
    const product = this.getItem(id);
    this.setState(() => {
      return { modalProduct: product, modalOpen: true };
    });
  };

  // close modal
  closeModal = () => {
    this.setState(() => {
      return { modalOpen: false };
    });
  };

  // increment
  increment = id => {
    let tempCart = [...this.state.cart]
    const selectedProduct = tempCart.find(item=> item.id === id)
    const index = tempCart.indexOf(selectedProduct)

    const product = tempCart[index]
    product.count = product.count + 1 
    product.total = product.count * product.price

    this.setState(()=>{return{cart:[...tempCart]}}, ()=> {
      this.addTotals()
    } )
  };
  // decrement 
  decrement = id => {
    let tempCart = [...this.state.cart];
    const selectedProduct = tempCart.find(item => item.id === id);
    const index = tempCart.indexOf(selectedProduct);
    const product = tempCart[index];

    product.count = product.count - 1
    if (product.count === 0) {
      this.removeItem(id)
    } else {
      product.total = product.count * product.price
      this.setState(
        () => {
          return { cart: [...tempCart] };
        },
        () => {
          this.addTotals();
        }
      );
    }
  };


  removeItem = (id) => {
    let tempProducts = [...this.state.products]
    let tempCart = [...this.state.cart]

    tempCart = tempCart.filter(item => item.id !== id)

    const index = tempProducts.indexOf(this.getItem(id))
    let removedProduct = tempProducts[index]

    removedProduct.inCart = false
    removedProduct.count = 0
    removedProduct.total = 0

    this.setState(()=> {
      return {
        cart: [...tempCart],
        products:[...tempProducts]
      }
    }, ()=> {
      this.addTotals()
    })

  }

  clearCart = () => {
    this.setState(()=> {
      return {cart: []}
    }, ()=> {
      this.setProducts()
      this.addTotals()
    })
  }

  addTotals = () => {
    let subTotal = 0
    this.state.cart.map(item => (subTotal += item.total ))
    const tempTax = subTotal * 0.09
    const tax = parseFloat(tempTax.toFixed(2))
    const total = subTotal + tax

    this.setState(()=> {
      return {
        cartSubTotal: subTotal,
        cartTax: tax,
        cartTotal: total
      }
    })
  }
  render() {
    return (
      <ProductContext.Provider
        value={{
          // getting all the data products destructuring
          ...this.state,
          handleDetail: this.handleDetail,
          addToCart: this.addToCart,
          openModal: this.openModal,
          closeModal: this.closeModal, 
          increment: this.increment,
          decrement: this.decrement,
          clearCart: this.clearCart, 
          removeItem: this.removeItem
        }}>
        {this.props.children}
      </ProductContext.Provider>
    );
  }
}
const ProductConsumer = ProductContext.Consumer

export { ProductProvider, ProductConsumer }

