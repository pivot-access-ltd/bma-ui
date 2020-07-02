import { act } from "react-dom/test-utils";
import { MemoryRouter } from "react-router-dom";
import { mount } from "enzyme";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import React from "react";

import CommissionForm from "./CommissionForm";

const mockStore = configureStore();

describe("CommissionForm", () => {
  let initialState;
  beforeEach(() => {
    initialState = {
      general: {
        machineActions: {
          data: [{ name: "commission", sentence: "commission" }],
        },
      },
      machine: {
        errors: {},
        loading: false,
        loaded: true,
        items: [{ system_id: "abc123" }, { system_id: "def456" }],
        selected: [],
        statuses: {
          abc123: {},
          def456: {},
        },
      },
      scripts: {
        errors: {},
        loading: false,
        loaded: true,
        items: [
          {
            name: "smartctl-validate",
            tags: ["commissioning", "storage"],
            parameters: {
              storage: {
                argument_format: "{path}",
                type: "storage",
              },
            },
            type: 2,
          },
          {
            name: "custom-commissioning-script",
            tags: ["node"],
            type: 0,
          },
        ],
      },
    };
  });

  it("correctly dispatches actions to commission selected machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CommissionForm
            setProcessing={jest.fn()}
            setSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );

    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          enableSSH: true,
          skipBMCConfig: true,
          skipNetworking: true,
          skipStorage: true,
          updateFirmware: true,
          configureHBA: true,
          testingScripts: [state.scripts.items[0]],
          commissioningScripts: [state.scripts.items[1]],
          scriptInputs: { testingScript0: { url: "www.url.com" } },
        })
    );
    expect(
      store
        .getActions()
        .filter((action) => action.type === "COMMISSION_MACHINE")
    ).toStrictEqual([
      {
        type: "COMMISSION_MACHINE",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: "commission",
            extra: {
              enable_ssh: true,
              skip_bmc_config: true,
              skip_networking: true,
              skip_storage: true,
              commissioning_scripts: [
                state.scripts.items[1].id,
                "update_firmware",
                "configure_hba",
              ],
              testing_scripts: [state.scripts.items[0].id],
              script_input: { testingScript0: { url: "www.url.com" } },
            },
            system_id: "abc123",
          },
        },
      },
      {
        type: "COMMISSION_MACHINE",
        meta: {
          model: "machine",
          method: "action",
        },
        payload: {
          params: {
            action: "commission",
            extra: {
              enable_ssh: true,
              skip_bmc_config: true,
              skip_networking: true,
              skip_storage: true,
              commissioning_scripts: [
                state.scripts.items[1].id,
                "update_firmware",
                "configure_hba",
              ],
              testing_scripts: [state.scripts.items[0].id],
              script_input: { testingScript0: { url: "www.url.com" } },
            },
            system_id: "def456",
          },
        },
      },
    ]);
  });

  it("can show the status when processing machines", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    state.machine.statuses.abc123 = { commissioning: true };
    const store = mockStore(state);
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CommissionForm
            processing={true}
            setProcessing={jest.fn()}
            setSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    expect(wrapper.find("FormikForm").prop("saving")).toBe(true);
    expect(wrapper.find('[data-test="loading-label"]').text()).toBe(
      "Starting commissioning for 1 of 2 machines..."
    );
  });

  it("can set the processing state when successfully submitting", () => {
    const state = { ...initialState };
    state.machine.selected = ["abc123", "def456"];
    const store = mockStore(state);
    const setProcessing = jest.fn();
    const wrapper = mount(
      <Provider store={store}>
        <MemoryRouter
          initialEntries={[{ pathname: "/machines", key: "testKey" }]}
        >
          <CommissionForm
            setProcessing={setProcessing}
            setSelectedAction={jest.fn()}
          />
        </MemoryRouter>
      </Provider>
    );
    act(() =>
      wrapper
        .find("Formik")
        .props()
        .onSubmit({
          enableSSH: true,
          skipBMCConfig: true,
          skipNetworking: true,
          skipStorage: true,
          updateFirmware: true,
          configureHBA: true,
          testingScripts: [state.scripts.items[0]],
          commissioningScripts: [state.scripts.items[1]],
        })
    );
    expect(setProcessing).toHaveBeenCalledWith(true);
  });
});