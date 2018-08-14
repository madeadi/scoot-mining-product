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
    discounts: []
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
        console.log(this.product);

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
    checkout: function(data){
      var payload = {
        "user_email": "made.adi@gmail.com",
        "user_pwd": "123456",
        "order": [
          {
            "product_id": data.product.product_id,
            "qty": data.quantity
          }
        ],
        "payment_method": "CRYPTO",
        "usd_amount": 10000,
        "desired_crypto": "LTCT"
      };

      console.log(payload);

      axios
        .post(url + "/Sales", payload)
        .then(response => {
          console.log(response.data);
          });
      }
    }
  });