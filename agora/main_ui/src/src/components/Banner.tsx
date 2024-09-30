import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbDivider,
  BreadcrumbButton,
} from "@fluentui/react-components";
import {
  CalendarMonthFilled,
  CalendarMonthRegular,
  bundleIcon,
} from "@fluentui/react-icons";

const CalendarMonth = bundleIcon(CalendarMonthFilled, CalendarMonthRegular);
const path = "https://www.bing.com/";

export const Default = () => {
  return (
    <Breadcrumb>
      <BreadcrumbItem>
        <BreadcrumbButton href={path}>Home</BreadcrumbButton>
      </BreadcrumbItem>
      <BreadcrumbDivider />
      <BreadcrumbItem>
        <BreadcrumbButton href={path} icon={<CalendarMonth />}>
          Applications
        </BreadcrumbButton>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};
