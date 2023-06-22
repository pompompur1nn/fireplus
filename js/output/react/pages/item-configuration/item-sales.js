class ItemSales extends React.Component {
  constructor(props) {
    super(props);
    this.itemType = this.getItemType();
  }

  getItemType() {
    if (location.pathname.toLowerCase().startsWith("/game-pass/configure")) {
      return "GamePass";
    }

    return "Asset";
  }

  loadSalesData(days) {
    console.log("Load sales data", this.itemType, this.props.itemId);
    return RPlus.bucketedSales.getBucketedItemSales(this.itemType, this.props.itemId, days);
  }

  loadRevenueData(days) {
    console.log("Load revenue data", this.itemType, this.props.itemId);
    return RPlus.bucketedSales.getBucketedItemRevenue(this.itemType, this.props.itemId, days);
  }

  getItemScanStatus() {
    return RPlus.bucketedSales.getItemScanStatus(this.itemType, this.props.itemId);
  }

  render() {
    return /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement(BucketedSalesChart, {
      loadSalesData: this.loadSalesData.bind(this),
      getScanStatus: this.getItemScanStatus.bind(this),
      name: "Sales"
    }), /*#__PURE__*/React.createElement(BucketedSalesChart, {
      loadSalesData: this.loadRevenueData.bind(this),
      getScanStatus: this.getItemScanStatus.bind(this),
      name: "Revenue"
    }));
  }

}

Roblox.users.getAuthenticatedUser().then(function (user) {
  RPlus.premium.isPremium(user.id).then(function (premium) {
    if (!premium) {
      // TODO: Missed oppurtunity to upsell.
      return;
    }

    setInterval(function () {
      var itemId = Number($("item-configuration").attr("item-id"));

      if (isNaN(itemId) || itemId <= 0) {
        return;
      }

      var itemSalesTab = $("item-sales");

      if (itemSalesTab.length > 0) {
        var itemSalesContainer = itemSalesTab.find("#rplus-item-sales");

        if (itemSalesContainer.length <= 0) {
          itemSalesContainer = $("<div id=\"rplus-item-sales\">");
          itemSalesTab.append(itemSalesContainer);
          console.log("Render ItemSales in #rplus-item-sales");
          ReactDOM.render( /*#__PURE__*/React.createElement(ItemSales, {
            itemId: itemId
          }), itemSalesContainer[0]);
        }
      }
    }, 500);
  }).catch(console.error);
}).catch(console.error); // WebGL3D