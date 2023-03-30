import { Search, SentimentDissatisfied } from "@mui/icons-material";
import {
  CircularProgress,
  Grid,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { useSnackbar } from "notistack";
import React, { useEffect, useState } from "react";
import { config } from "../App";
import Footer from "./Footer";
import Header from "./Header";
import "./Products.css";
import ProductCard from "./ProductCard";
import Cart, { generateCartItemsFrom } from "./Cart";
import { useHistory } from "react-router-dom";

const Products = () => {
  const { enqueueSnackbar } = useSnackbar();

  let username = localStorage.getItem("username");
  let userBalance = localStorage.getItem("balance");
  let userToken = localStorage.getItem("token");

  const [loading, setLoading] = useState(true);
  const [productList, setProductList] = useState([]);
  const [fullProductsList, setFullProductsList] = useState([]);
  const [cartData, setCartData] = useState([]);

  const history = useHistory();

  /**
   * Make API call to get the products list and store it to display the products
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on all available products
   *
   * API endpoint - "GET /products"
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "name": "iPhone XR",
   *          "category": "Phones",
   *          "cost": 100,
   *          "rating": 4,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "v4sLtEcMpzabRyfx"
   *      },
   *      {
   *          "name": "Basketball",
   *          "category": "Sports",
   *          "cost": 100,
   *          "rating": 5,
   *          "image": "https://i.imgur.com/lulqWzW.jpg",
   *          "_id": "upLK9JbQ4rMhTwt4"
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 500
   * {
   *      "success": false,
   *      "message": "Something went wrong. Check the backend console for more details"
   * }
   */
  const performAPICall = async () => {
    const url = config.endpoint + "/products";
    try {
      let { data: response } = await axios.get(url);
      setLoading(false);
      setFullProductsList(response);
      return response;
    } catch (error) {
      enqueueSnackbar(error.message, {
        variant: "error",
        autoHideDuration: 3000,
      });
    }
  };

  /**
   * Definition for search handler
   * This is the function that is called on adding new search keys
   *
   * @param {string} text
   *    Text user types in the search bar. To filter the displayed products based on this text.
   *
   * @returns { Array.<Product> }
   *      Array of objects with complete data on filtered set of products
   *
   * API endpoint - "GET /products/search?value=<search-query>"
   *
   */
  const performSearch = async (text) => {
    try {
      let url = config.endpoint + "/products/search?value=" + text;
      const { data: response } = await axios.get(url);
      return response;
    } catch (error) {
      if (error.response.status == 404) {
        return null;
      } else {
        enqueueSnackbar(error.message, {
          variant: "error",
          autoHideDuration: 3000,
        });
      }
    }
  };

  /**
   * Definition for debounce handler
   * With debounce, this is the function to be called whenever the user types text in the searchbar field
   *
   * @param {{ target: { value: string } }} event
   *    JS event object emitted from the search input field
   *
   * @param {NodeJS.Timeout} debounceTimeout
   *    Timer id set for the previous debounce call
   *
   */
  const debounceSearch = (event, debounceTimeout) => {
    setTimeout(() => {
      performSearch(event.target.value).then((res) => {
        if (res != null) {
          setProductList(res);
        } else {
          setProductList([]);
        }
      });
    }, debounceTimeout);
  };

  /**
   * Perform the API call to fetch the user's cart and return the response
   *
   * @param {string} token - Authentication token returned on login
   *
   * @returns { Array.<{ productId: string, qty: number }> | null }
   *    The response JSON object
   *
   * Example for successful response from backend:
   * HTTP 200
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 401
   * {
   *      "success": false,
   *      "message": "Protected route, Oauth2 Bearer token not found"
   * }
   */
  const fetchCart = async (token) => {
    if (!token) return;

    let url = config.endpoint + "/cart";

    const headers = {
      headers: {
        Authorization: "Bearer " + token,
      },
    };

    try {
      // TODO: CRIO_TASK_MODULE_CART - Pass Bearer token inside "Authorization" header to get data from "GET /cart" API and return the response data
      let { data: res } = await axios.get(url, headers).then((response) => {
        return response;
      });
      return res;
    } catch (e) {
      if (e.response && e.response.status === 400) {
        enqueueSnackbar(e.response.data.message, { variant: "error" });
        history.push("/login");
      } else {
        enqueueSnackbar(
          "Could not fetch cart details. Check that the backend is running, reachable and returns valid JSON.",
          {
            variant: "error",
          }
        );
      }
      return null;
    }
  };

  // TODO: CRIO_TASK_MODULE_CART - Return if a product already exists in the cart
  /**
   * Return if a product already is present in the cart
   *
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { String } productId
   *    Id of a product to be checked
   *
   * @returns { Boolean }
   *    Whether a product of given "productId" exists in the "items" array
   *
   */
  const isItemInCart = (items, productId) => {
    let present = false;
    items.forEach((item) => {
      if (item.productId === productId) {
        present = true;
      }
    });
    return present;
  };

  /**
   * Perform the API call to add or update items in the user's cart and update local cart data to display the latest cart
   *
   * @param {string} token
   *    Authentication token returned on login
   * @param { Array.<{ productId: String, quantity: Number }> } items
   *    Array of objects with productId and quantity of products in cart
   * @param { Array.<Product> } products
   *    Array of objects with complete data on all available products
   * @param {string} productId
   *    ID of the product that is to be added or updated in cart
   * @param {number} qty
   *    How many of the product should be in the cart
   * @param {boolean} options
   *    If this function was triggered from the product card's "Add to Cart" button
   *
   * Example for successful response from backend:
   * HTTP 200 - Updated list of cart items
   * [
   *      {
   *          "productId": "KCRwjF7lN97HnEaY",
   *          "qty": 3
   *      },
   *      {
   *          "productId": "BW0jAAeDJmlZCF8i",
   *          "qty": 1
   *      }
   * ]
   *
   * Example for failed response from backend:
   * HTTP 404 - On invalid productId
   * {
   *      "success": false,
   *      "message": "Product doesn't exist"
   * }
   */
  const addToCart = async (
    tokens,
    items,
    products,
    productId,
    qty,
    options = { preventDuplicate: false }
  ) => {
    if (username != null) {
      if (options.preventDuplicate) {
        if (isItemInCart(items, productId)) {
          enqueueSnackbar(
            "Item already in cart. Use the cart sidebar to update quantity or remove item.",
            {
              variant: "warning",
              autoHideDuration: 3000,
            }
          );
        } else {
          const url = config.endpoint + "/cart";
          const body = {
            productId: productId,
            qty: qty,
          };
          const headers = {
            headers: {
              Authorization: "Bearer " + userToken,
              "Content-type": "application/json; charset=utf-8",
            },
          };
          try {
            const { data: response } = await axios
              .post(url, body, headers)
              .then((res) => {
                return res;
              });
            setCartData(response);
          } catch (error) {
            enqueueSnackbar(error.response.data.message, {
              variant: "error",
              autoHideDuration: 3000,
            });
          }
        }
      } else {
        const url = config.endpoint + "/cart";
        const body = {
          productId: productId,
          qty: qty,
        };
        const headers = {
          headers: {
            Authorization: "Bearer " + userToken,
            "Content-type": "application/json; charset=utf-8",
          },
        };
        try {
          const { data: response } = await axios
            .post(url, body, headers)
            .then((res) => {
              return res;
            });
          setCartData(response);
        } catch (error) {
          enqueueSnackbar(error.response.data.message, {
            variant: "error",
            autoHideDuration: 3000,
          });
        }
      }
    } else {
      enqueueSnackbar("Login to add an item to the Cart", {
        variant: "warning",
        autoHideDuration: 3000,
      });
    }
  };

  useEffect(() => {
    performAPICall().then((res) => {
      setProductList(res);
    });
    fetchCart(userToken).then((res) => {
      setCartData(res);
    });
  }, []);

  return (
    <div>
      {username != null ? (
        <Header userData={{ logged: true, username: username }}>
          <TextField
            onChange={(event) => {
              debounceSearch(event, 500);
            }}
            className="search-desktop"
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            style={{
              maxWidth: "33%",
              margin: "auto",
            }}
          />
        </Header>
      ) : (
        <Header userData={{ logged: false }}>
          <TextField
            onChange={(event) => {
              debounceSearch(event, 500);
            }}
            className="search-desktop"
            fullWidth
            size="small"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Search color="primary" />
                </InputAdornment>
              ),
            }}
            placeholder="Search for items/categories"
            name="search"
            style={{
              maxWidth: "33%",
              margin: "auto",
            }}
          />
        </Header>
      )}

      <TextField
        onChange={(event) => {
          debounceSearch(event, 500);
        }}
        className="search-mobile"
        size="small"
        fullWidth
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search color="primary" />
            </InputAdornment>
          ),
        }}
        placeholder="Search for items/categories"
        name="search"
      />
      <Grid container>
        <Grid item xs={12} md={true}>
          <Grid container spacing={2}>
            <Grid item className="product-grid">
              <Box className="hero">
                <p className="hero-heading">
                  India’s{" "}
                  <span className="hero-highlight">FASTEST DELIVERY</span> to
                  your door step
                </p>
              </Box>
            </Grid>
            {loading ? (
              <div className="loading">
                <CircularProgress />
                <br />
                <p>Loading Products</p>
              </div>
            ) : productList.length != 0 ? (
              productList.map((item) => {
                return (
                  <Grid item className="product-grid" key={item._id} md={3} xs={6}>
                    <ProductCard
                      product={item}
                      handleAddToCart={() => {
                        addToCart(
                          userToken,
                          cartData,
                          fullProductsList,
                          item._id,
                          1,
                          { preventDuplicate: true }
                        );
                      }}
                    />
                  </Grid>
                );
              })
            ) : (
              <div className="loading">
                <SentimentDissatisfied />
                <p>No Products Found</p>
              </div>
            )}
          </Grid>
        </Grid>
        {username != null && (
          <Grid item xs={12} md={3} style={{ backgroundColor: "#E9F5E1" }}>
            <Cart
              products={fullProductsList}
              items={generateCartItemsFrom(cartData, fullProductsList)}
              handleQuantity={addToCart}
            />
          </Grid>
        )}
      </Grid>
      <br />
      <Footer />
    </div>
  );
};

export default Products;
