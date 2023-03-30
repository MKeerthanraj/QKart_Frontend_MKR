import Register from "./components/Register";
import ipConfig from "./ipConfig.json";
import { Route, Switch } from "react-router-dom";
import Login from "./components/Login";
import Products from "./components/Products";
import Checkout from "./components/Checkout"
import Thanks from "./components/Thanks";

export const config = {
  endpoint: `http://${ipConfig.workspaceIp}:8082/api/v1`,
};

function App() {
  return (
    <div className="App">
      <Switch>
        <Route path="/register" component={Register}>
          <Register />
        </Route>
        <Route path="/login" component={Login}>
          <Login />
        </Route>
        <Route path="/checkout" component={Checkout}>
          <Checkout />
        </Route>
        <Route path="/thanks" component={Thanks}>
          <Thanks/>
        </Route>
        <Route path="/" component={Products}>
          <Products />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
