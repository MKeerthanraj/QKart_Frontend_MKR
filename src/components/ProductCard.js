import { AddShoppingCartOutlined } from "@mui/icons-material";
import {
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Rating,
  Typography,
} from "@mui/material";
import React from "react";
import "./ProductCard.css";

const ProductCard = ({ product, handleAddToCart }) => {
  return (
    <Card className="card">
      <CardMedia component="img" image={product.image} />
      <CardContent>
        <Typography variant="h6">{product.name}</Typography>
        <Typography variant="body1">
          <strong>{"$" + product.cost}</strong>
        </Typography>
        <Rating name="read-only" value={product.rating} readOnly />
        </CardContent>
        <CardActions className="card-actions">
        <Button className="card-button" variant="contained" onClick={handleAddToCart} fullWidth>
          <AddShoppingCartOutlined/> ADD TO CART
        </Button>
        </CardActions>
    </Card>
  );
};

export default ProductCard;
