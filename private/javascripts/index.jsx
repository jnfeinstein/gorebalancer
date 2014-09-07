/** @jsx React.DOM */

var jQueryMixin = {
  componentDidMount: function() {
    this.$el = $(this.getDOMNode());
  }
};

var StockModel = Backbone.Model.extend({
  defaults: {
    ticker: "",
    quantity: 0,
    price: 0,
    target: 0,
    margin: 0
  },
  value: function() {
    var value = this.get('quantity') * this.get('price');
    return !_.isNaN(value) && value;
  }
});

var StockCollection = Backbone.Collection.extend({
  model: StockModel
});

var StockComponent = React.createBackboneClass({
  getInitialState: function() {
    return {
      shouldRebalance: this.shouldRebalance(this.props.total)
    }
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({shouldRebalance: this.shouldRebalance(nextProps.total)});
  },
  render: function() {
    var model = this.getModel();

    var shouldRebalanceText = "";
    if (_.isBoolean(this.state.shouldRebalance)) {
      shouldRebalanceText = this.state.shouldRebalance ? "Yes" : "No";
    }

    return (
      <tr>
        <td><input type="text" defaultValue={model.get('ticker')} data-field="ticker" onChange={this.handleInput} /></td>
        <td><input type="number" min="1" step="1" defaultValue={model.get('quantity')} data-field="quantity" onChange={this.handleNumericInput} /></td>
        <td>$<input type="number" min="0.01" step="0.01" defaultValue={model.get('price')} data-field="price"  onChange={this.handleNumericInput} /></td>
        <td><input type="number" min="0.01" step="0.01" defaultValue={model.get('target')} data-field="target"  onChange={this.handlePercentInput} />%</td>
        <td><input type="number" min="0.01" step="0.01" defaultValue={model.get('margin')} data-field="margin"  onChange={this.handlePercentInput} />%</td>
        <td className="stock-rebalance">{shouldRebalanceText}</td>
      </tr>
    );
  },
  handleInput: function(e, val) {
    var $target = $(e.target);
    var field = $target.data().field;
    if (_.isUndefined(val)) {
      val = $target.val();
    }
    this.getModel().set(field, val);
  },
  handleNumericInput: function(e) {
    var val = $(e.target).val();
    if (val) {
      this.handleInput(e, parseInt(val));
    }
  },
  handlePercentInput: function(e) {
    var val = $(e.target).val();
    if (val) {
      this.handleInput(e, parseInt(val) / 100);
    }
  },
  shouldRebalance: function(total) {
    var model = this.getModel(),
        value = model.value();

    if (value) {
      var currentPercentage = model.value() / total,
      currentDifference = Math.abs(model.get('target') - currentPercentage);

      return currentDifference > model.get('margin');
    }
  }
});

var StockListComponent = React.createBackboneClass({
  mixins: [React.BackboneMixin({propName: "collection",renderOn: "change"})],
  render : function() {
    var collection = this.getCollection();
    var total = collection.reduce(function(memo, model){ return memo + model.value(); }, 0);
    var totalTarget = collection.reduce(function(memo, model){ return memo + model.get('target'); }, 0);
    var stocks = collection.map(function(stock) {
      return <StockComponent key={stock.id || stock.cid} model={stock} total={total} />
    });
    return (
      <div className="stock-container">
        <table className="stock-table">
        <thead>
          <tr>
            <th>Ticker</th>
            <th>Quantity</th>
            <th>Price</th>
            <th>Target</th>
            <th>Margin</th>
            <th>Rebalance?</th>
          </tr>
        </thead>
        <tbody>
          {stocks}
        </tbody>
        <tfoot>
          <tr>
            <td />
            <td />
            <td />
            <td>{totalTarget * 100}%</td>
            <td />
            <td />
          </tr>
        </tfoot>
        </table>
      </div>
    );
  },
});

var InterfaceComponent = React.createClass({
  getInitialState: function() {
    return {
      stocks: new StockCollection()
    }
  },
  render : function() {
    return (
      <div className="main-container">
        <StockListComponent collection={this.state.stocks} />
        <div className="controls">
          <a href="javascript:;" className="btn" onClick={this.addBlankStock}>Add stock</a>
        </div>
      </div>
    );
  },
  addBlankStock: function() {
    this.state.stocks.add({});
  }
});

$(function() {
  React.renderComponent(
    <InterfaceComponent />,
    document.getElementById('example')
  );
});