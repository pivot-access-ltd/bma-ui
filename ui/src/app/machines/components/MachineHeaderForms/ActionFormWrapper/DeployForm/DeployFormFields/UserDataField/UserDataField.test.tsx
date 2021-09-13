import type { ReactWrapper } from "enzyme";
import { mount } from "enzyme";
import { act } from "react-dom/test-utils";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";
import configureStore from "redux-mock-store";

import DeployForm from "../../DeployForm";

import type { RootState } from "app/store/root/types";
import {
  authState as authStateFactory,
  configState as configStateFactory,
  defaultMinHweKernelState as defaultMinHweKernelStateFactory,
  generalState as generalStateFactory,
  machine as machineFactory,
  machineState as machineStateFactory,
  machineStatus as machineStatusFactory,
  osInfo as osInfoFactory,
  osInfoState as osInfoStateFactory,
  rootState as rootStateFactory,
  user as userFactory,
  userState as userStateFactory,
} from "testing/factories";

const mockStore = configureStore();

class MockFileReader {
  result: string;
  constructor() {
    this.result = "test file content";
  }
  onabort = () => undefined;
  onerror = () => undefined;
  onload = () => undefined;
  readAsText() {
    this.onload();
  }
}

const createFile = (
  name: string,
  size: number,
  type: string,
  contents = ""
) => {
  const file = new File([contents], name, { type });
  Reflect.defineProperty(file, "size", {
    get() {
      return size;
    },
  });
  return file;
};

describe("DeployFormFields", () => {
  let state: RootState;
  let wrapper: ReactWrapper;

  beforeEach(async () => {
    const machines = [
      machineFactory({ system_id: "abc123" }),
      machineFactory({ system_id: "def456" }),
    ];
    state = rootStateFactory({
      config: configStateFactory({
        items: [
          {
            name: "default_osystem",
            value: "ubuntu",
            choices: [
              ["centos", "CentOS"],
              ["ubuntu", "Ubuntu"],
            ],
          },
        ],
        loaded: true,
      }),
      general: generalStateFactory({
        defaultMinHweKernel: defaultMinHweKernelStateFactory({
          data: "",
          loaded: true,
        }),
        osInfo: osInfoStateFactory({
          data: osInfoFactory({
            osystems: [
              ["centos", "CentOS"],
              ["ubuntu", "Ubuntu"],
            ],
            releases: [
              ["centos/centos66", "CentOS 6"],
              ["centos/centos70", "CentOS 7"],
              ["ubuntu/bionic", 'Ubuntu 18.04 LTS "Bionic Beaver"'],
              ["ubuntu/focal", 'Ubuntu 20.04 LTS "Focal Fossa"'],
            ],
            kernels: {
              ubuntu: {
                bionic: [
                  ["ga-18.04", "bionic (ga-18.04)"],
                  ["ga-18.04-lowlatency", "bionic (ga-18.04-lowlatency)"],
                  ["hwe-18.04", "bionic (hwe-18.04)"],
                  ["hwe-18.04-edge", "bionic (hwe-18.04-edge)"],
                  ["hwe-18.04-lowlatency", "bionic (hwe-18.04-lowlatency)"],
                  [
                    "hwe-18.04-lowlatency-edge",
                    "bionic (hwe-18.04-lowlatency-edge)",
                  ],
                ],
                focal: [
                  ["ga-20.04", "focal (ga-20.04)"],
                  ["ga-20.04-lowlatency", "focal (ga-20.04-lowlatency)"],
                ],
              },
            },
            default_osystem: "ubuntu",
            default_release: "focal",
          }),
          loaded: true,
        }),
      }),
      machine: machineStateFactory({
        loaded: true,
        items: machines,
        statuses: {
          abc123: machineStatusFactory(),
          def456: machineStatusFactory(),
        },
      }),
      user: userStateFactory({
        auth: authStateFactory({
          saved: false,
          user: userFactory({
            email: "test@example.com",
            global_permissions: ["machine_create"],
            id: 1,
            is_superuser: true,
            last_name: "",
            sshkeys_count: 1,
            username: "admin",
          }),
        }),
        loaded: true,
      }),
    });
    const store = mockStore(state);
    const mockedFileReader = jest.spyOn(window, "FileReader");
    (mockedFileReader as jest.Mock).mockImplementation(
      () => new MockFileReader()
    );
    wrapper = mount(
      <Provider store={store}>
        <MemoryRouter initialEntries={[{ pathname: "/" }]}>
          <DeployForm clearHeaderContent={jest.fn()} />
        </MemoryRouter>
      </Provider>
    );
    await act(async () => {
      wrapper.find("input[name='includeUserData']").simulate("change", {
        target: { name: "includeUserData", checked: true },
      });
    });
    wrapper.update();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("accepts files of any mimetype", async () => {
    const files = [createFile("foo.sh", 2000, "")];
    await act(async () => {
      wrapper.find("UserDataField input[type='file']").simulate("change", {
        target: { files },
      });
    });
    wrapper.update();
    expect(wrapper.find("FormikField[name='userData']").prop("error")).toEqual(
      null
    );
  });

  it("displays an error if a file larger than 2MB is uploaded", async () => {
    const files = [createFile("foo.sh", 3000000, "text/script")];
    await act(async () => {
      wrapper.find("UserDataField input[type='file']").simulate("change", {
        target: { files },
      });
    });
    wrapper.update();
    expect(wrapper.find("FormikField[name='userData']").prop("error")).toEqual(
      "File is larger than 2000000 bytes"
    );
  });

  it("displays a single error if multiple files are uploaded", async () => {
    const files = [
      createFile("foo.sh", 1000, "text/script"),
      createFile("bar.sh", 1000, "text/script"),
    ];
    await act(async () => {
      wrapper.find("UserDataField input[type='file']").simulate("change", {
        target: { files },
      });
    });
    wrapper.update();
    expect(wrapper.find("FormikField[name='userData']").prop("error")).toEqual(
      "Only a single file may be uploaded."
    );
  });

  it("can populate the textarea from the file", async () => {
    const files = [createFile("foo.sh", 2000, "text/script")];
    await act(async () => {
      wrapper.find("UserDataField input[type='file']").simulate("change", {
        target: { files },
      });
    });
    wrapper.update();
    expect(wrapper.find("textarea[name='userData']").prop("value")).toEqual(
      "test file content"
    );
  });
});