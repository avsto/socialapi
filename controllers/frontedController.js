
exports.privacyPolicy = (req, res) => {
  res.render("PrivacyPolicy", {
    title: "Privacy Policy",
  });
};

exports.home = (req, res) => {
  res.render("Home", {
    title: "Home",
  });
};
