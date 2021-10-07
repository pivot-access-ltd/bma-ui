import { mount } from "enzyme";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import KVMDetailsHeader from "./KVMDetailsHeader";

import { KVMHeaderViews } from "app/kvm/constants";
import type { RootState } from "app/store/root/types";
import {
  pod as podFactory,
  podResources as podResourcesFactory,
  podState as podStateFactory,
  podStatus as podStatusFactory,
  podStatuses as podStatusesFactory,
  podVmCount as podVmCountFactory,
  rootState as rootStateFactory,
} from "testing/factories";

const mockStore = configureStore();

describe("KVMDetailsHeader", () => {
  let state: RootState;

  beforeEach(() => {
    state = rootStateFactory({
      pod: podStateFactory({
        errors: {},
        loading: false,
        loaded: true,
        items: [
          podFactory({
            id: 1,
            name: "pod-1",
            resources: podResourcesFactory({
              vm_count: podVmCountFactory({ tracked: 10 }),
            }),
          }),
        ],
        statuses: podStatusesFactory({
          1: podStatusFactory(),
        }),
      }),
    });
  });

  it("renders title block content if no header content has been selected", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMDetailsHeader
            headerContent={null}
            setHeaderContent={jest.fn()}
            setSearchFilter={jest.fn()}
            tabLinks={[]}
            titleBlocks={[{ title: "Title", subtitle: "Subtitle" }]}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("[data-test='title-blocks']").exists()).toBe(true);
    expect(wrapper.find("[data-test='form-title']").exists()).toBe(false);
    expect(wrapper.find("KVMHeaderForms").exists()).toBe(false);
  });

  it("renders header forms and name if header content has been selected", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMDetailsHeader
            headerContent={{ view: KVMHeaderViews.COMPOSE_VM }}
            setHeaderContent={jest.fn()}
            setSearchFilter={jest.fn()}
            tabLinks={[]}
            titleBlocks={[{ title: "Title", subtitle: "Subtitle" }]}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("KVMHeaderForms").exists()).toBe(true);
    expect(wrapper.find("[data-test='form-title']").text()).toBe("Compose");
    expect(wrapper.find("[data-test='title-blocks']").exists()).toBe(false);
  });

  it("mutes the second title onward", () => {
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/kvm/1", key: "testKey" }]}>
          <KVMDetailsHeader
            headerContent={null}
            setHeaderContent={jest.fn()}
            setSearchFilter={jest.fn()}
            tabLinks={[]}
            titleBlocks={[
              { title: "Not muted" },
              { title: "Muted" },
              { title: "Muted" },
            ]}
          />
        </MemoryRouter>
      </Provider>
    );
    const getTitleClassName = (i: number) =>
      wrapper
        .find("[data-test='block-title']")
        .at(i)
        .prop("className") as string;

    expect(getTitleClassName(0).includes("u-text--muted")).toBe(false);
    expect(getTitleClassName(1).includes("u-text--muted")).toBe(true);
    expect(getTitleClassName(2).includes("u-text--muted")).toBe(true);
  });
});
