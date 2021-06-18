import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter, Route } from "react-router-dom";
import configureStore from "redux-mock-store";

import DomainNotFound from "./DomainNotFoundHeader";

import {
  domain as domainFactory,
  domainState as domainStateFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("DomainNotFound", () => {
  it("shows the domain id if the domain is not found", () => {
    const state = rootStateFactory({
      domain: domainStateFactory({
        items: [domainFactory({ id: 1, name: "domain-in-the-membrane" })],
      }),
    });
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/domain/12", key: "testKey" }]}
        >
          <Route
            exact
            path="/domain/:id"
            component={() => <DomainNotFound />}
          />
        </MemoryRouter>
      </Provider>
    );

    expect(wrapper.find("[data-test='section-header-title']").text()).toBe(
      "No item with pk: 12"
    );
  });
});
