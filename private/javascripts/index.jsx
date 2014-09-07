/** @jsx React.DOM */

var InterfaceComponent = React.createClass({
  componentDidMount: function() {

  },
  render : function() {
    return (
      <div className="main-container">

      </div>
    );
  }
});

$(function() {
  React.renderComponent(
    <InterfaceComponent />,
    document.getElementById('example')
  );
});