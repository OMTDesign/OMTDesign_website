/**
 * Custom JS for theme elements
 */

/**
 * Wocommerce active class for category list
 */
let elevateBizurl = window.location.href;
const elevateBizcatLink = document.querySelectorAll(
  ".wc-block-product-categories-list li a"
);
elevateBizcatLink.forEach((item) => {
  if (item.href === elevateBizurl) {
    item.classList.add("active");
  }
});

/*
    Add class in body when search clicked
*/
let elevateBizsearchBtn = document.querySelector(".search-controller svg.search");

if (elevateBizsearchBtn !== null) {
  elevateBizsearchBtn.addEventListener("click", function (e) {
    document.body.classList.remove("open-social");
    document.body.classList.add("open-search");
    document.body.addEventListener("click", function () {
      document.body.classList.remove("open-search");
    });

    let elevateBizsearchContainer = document.querySelector(".search-container");
    elevateBizsearchContainer.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    var elevateBizsearchInput = document.querySelector(".wp-block-search__input");
    window.setTimeout(() => elevateBizsearchInput.focus(), 0);
  });
}

var elevateBizsearchBtnClose = document.querySelector(
  ".search-controller svg.cross"
);

if (elevateBizsearchBtnClose !== null) {
  elevateBizsearchBtnClose.addEventListener("click", function (e) {
    document.body.classList.remove("open-search");

  });
}


/*
    Add class in body when social clicked
*/
let elevateBizsocialBtn = document.querySelector(".social-controller svg.social");

if (elevateBizsocialBtn !== null) {
  elevateBizsocialBtn.addEventListener("click", function (e) {
    document.body.classList.remove("open-search");
    document.body.classList.add("open-social");
    document.body.addEventListener("click", function () {
      document.body.classList.remove("open-social");
    });

    let elevateBizsocialContainer = document.querySelector(".social-container");
    elevateBizsocialContainer.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    var elevateBizsocialInput = document.querySelector(".wp-block-social__input");
    window.setTimeout(() => elevateBizsocialInput.focus(), 0);
  });
}

var elevateBizsocialBtnClose = document.querySelector(
  ".social-controller svg.cross"
);

if (elevateBizsocialBtnClose !== null) {
  elevateBizsocialBtnClose.addEventListener("click", function (e) {
    document.body.classList.remove("open-social");

  });
}

/*
    Add blinker on input field when active
*/
let elevateBizblinkerField = document.querySelector(".social-controller svg.search");

if (elevateBizblinkerField !== null) {
  elevateBizblinkerField.addEventListener("click", function () {
    var elevateBizsearchInput = document.querySelector(".wp-block-search__input");
        window.setTimeout(() => elevateBizsearchInput.focus(), 0);
  });
}

// Function to Add/remove class for mobile Woocommerce sidebar Widgets/filters
const toggleFunc = (targetElem) => {
  let filterButtons = document.querySelectorAll(targetElem);

  filterButtons.forEach((filterButton) => {
    if (filterButton !== null) {
      filterButton.addEventListener("click", () => {
        if (filterButton.classList.contains("toggled-on")) {
          // if has 'toggled-on' class remove class
          filterButton.classList.remove("toggled-on");
        } else {
          // otherwise add 'toggled-on' class
          filterButton.classList.add("toggled-on");
        }
      });
    }
  });
};

toggleFunc(".btn-mobile-filters");
