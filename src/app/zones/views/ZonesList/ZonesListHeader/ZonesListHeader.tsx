import { Button } from "@canonical/react-components";
import { useSelector } from "react-redux";

import ZonesListTitle from "./ZonesListTitle";

import SectionHeader from "app/base/components/SectionHeader";
import { useFetchActions } from "app/base/hooks";
import type { SetSidePanelContent } from "app/base/side-panel-context";
import { actions } from "app/store/zone";
import zoneSelectors from "app/store/zone/selectors";
import { ZoneActionSidePanelViews } from "app/zones/constants";

const ZonesListHeader = ({
  setSidePanelContent,
}: {
  setSidePanelContent: SetSidePanelContent;
}): JSX.Element => {
  const zonesCount = useSelector(zoneSelectors.count);
  const zonesLoaded = useSelector(zoneSelectors.loaded);

  useFetchActions([actions.fetch]);

  const buttons = [
    <Button
      data-testid="add-zone"
      key="add-zone"
      onClick={() => {
        setSidePanelContent({ view: ZoneActionSidePanelViews.CREATE_ZONE });
      }}
    >
      Add AZ
    </Button>,
  ];

  return (
    <SectionHeader
      buttons={buttons}
      subtitle={`${zonesCount} AZs available`}
      subtitleLoading={!zonesLoaded}
      title={<ZonesListTitle />}
    ></SectionHeader>
  );
};

export default ZonesListHeader;
