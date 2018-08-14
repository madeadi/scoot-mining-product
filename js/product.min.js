function gup( name, url ) {
  if (!url) url = location.href;
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( url );
  return results == null ? null : results[1];
}

var url = "https://hash.scoop.tech/api";

var scoop = new Vue({
  el: "#product",    
  data: {
    customerEmail: "",
    coinPaymentMerchant: "85512ccd39b38e02ad72f1c1f5a5d0c5",
    products: [],
    product: "",
    product_id: "",
    discounts: [],
    email: "",
    password: "",
    currency: "",
    quantity: 0,
    payment_detail: {
      address: "",
      amount_crypto: 0,
      status_url: "",
      txn_id: "",
      timeout: "",
      currency: ""
    },
    is_buying: false,
  },
  computed: {
    price: function(){
      let discount_rate = 0;
      for(let i = this.discounts.length-1; i >= 0; i--){
        discount = this.discounts[i];
        if(this.quantity >= discount.lower_limit){
          discount_rate = discount.discount;
          break;
        }
      }
      let price_after_discount = this.product.usd_price * this.quantity * (1 - discount_rate);
      return price_after_discount;
    },
    tax: function(){
      return this.price * 0.07;
    },
    total_price: function(){
      return this.price + this.tax;
    },
    buy_button_text: function(){
      return this.is_buying ? "Processing..." : "Buy Now"
    }
  },
  mounted: function(){
    let product_id = gup("product_id", window.location);
    this.product_id = product_id;
    axios
      .get(url + "/Sales")
      .then(response => {
        this.products = response.data.available_products;
        let product = this.products.find(function(element){
          if(element.product_id === product_id){            
            return element;
          }
        });                
        this.product = product !== undefined ? product : this.products[0];

        // calculate discount
        let keys = Object.keys(this.product);
        let discounts = [];
        for(let i=0; i < keys.length; i++){
          let key = keys[i];
          if(key.indexOf('discount_perc_') === 0){
            discounts.push({
              lower_limit: parseInt(key.replace('discount_perc_', '')),
              discount: this.product[key]
            });
          }
        }
        this.discounts = discounts;
      });
  },
  methods: {
    checkout: function(){
      this.is_buying = true;
      var payload = {
        "user_email": this.email,
        "user_pwd": this.password,
        "order": [
          {
            "product_id": this.product.product_id,
            "qty": this.quantity
          }
        ],
        "payment_method": "CRYPTO",
        "usd_amount": this.total_price,
        "desired_crypto": this.currency
      };

      axios
        .post(url + "/Sales", payload)
        .then(function(response){
          scoop.payment_detail = Object.assign({}, response.data);
          scoop.payment_detail.currency = scoop.currency;
          scoop.is_buying = false;
        });
      }
    }
  });