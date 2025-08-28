
export const aboutController = {
  index(req, res) {
    const viewData = { title: "WeatherTop" };
    res.render("about-view", viewData);
  },
};
