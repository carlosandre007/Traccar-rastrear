import { grey } from "@mui/material/colors";
import createPalette from "@mui/material/styles/createPalette";
import { loadImage, prepareIcon } from "./mapUtil";

import directionSvg from "../../resources/images/direction.svg";
import startSvg from "../../resources/images/icon/start.svg";
import finishSvg from "../../resources/images/icon/finish.svg";

import bicycleSvg from "../../resources/images/newIcons/bicycle.png";
import boatSvg from "../../resources/images/newIcons/boat.png";
import busSvg from "../../resources/images/newIcons/bus.png";
import carSvg from "../../resources/images/newIcons/car.png";
import camperSvg from "../../resources/images/newIcons/camper.png";
import craneSvg from "../../resources/images/newIcons/crane.png";
import helicopterSvg from "../../resources/images/newIcons/helicopter.png";
import motorcycleSvg from "../../resources/images/newIcons/motorcycle.png";
import offroadSvg from "../../resources/images/newIcons/offroad.png";
import personSvg from "../../resources/images/newIcons/person.png";
import pickupSvg from "../../resources/images/newIcons/pickup.png";
import planeSvg from "../../resources/images/newIcons/plane.png";
import scooterSvg from "../../resources/images/newIcons/scooter.png";
import shipSvg from "../../resources/images/newIcons/ship.png";
import tractorSvg from "../../resources/images/newIcons/tractor.png";
import trainSvg from "../../resources/images/newIcons/train.png";
import tramSvg from "../../resources/images/newIcons/tram.png";
import trolleybusSvg from "../../resources/images/newIcons/trolleybus.png";
import truckSvg from "../../resources/images/newIcons/truck.png";
import vanSvg from "../../resources/images/newIcons/van.png";
import defaultSvg from "../../resources/images/newIcons/default.png";
import animalSvg from "../../resources/images/newIcons/animal.png";

import backgroundSvg from "../../resources/images/newBackground.png";

export const mapIcons = {
  animal: animalSvg,
  bicycle: bicycleSvg,
  boat: boatSvg,
  bus: busSvg,
  car: carSvg,
  camper: camperSvg,
  crane: craneSvg,
  default: defaultSvg,
  finish: finishSvg,
  helicopter: helicopterSvg,
  motorcycle: motorcycleSvg,
  offroad: offroadSvg,
  person: personSvg,
  pickup: pickupSvg,
  plane: planeSvg,
  scooter: scooterSvg,
  ship: shipSvg,
  start: startSvg,
  tractor: tractorSvg,
  train: trainSvg,
  tram: tramSvg,
  trolleybus: trolleybusSvg,
  truck: truckSvg,
  van: vanSvg,
};

export const mapIconKey = (category) =>
  mapIcons.hasOwnProperty(category) ? category : "default";

export const mapImages = {};

const mapPalette = createPalette({
  neutral: { main: grey[500] },
});

export default async () => {
  const background = await loadImage(backgroundSvg);
  mapImages.background = await prepareIcon(background);
  mapImages.direction = await prepareIcon(await loadImage(directionSvg));
  await Promise.all(
    Object.keys(mapIcons).map(async (category) => {
      const results = [];
      ["info", "success", "error", "neutral"].forEach((color) => {
        results.push(
          loadImage(mapIcons[category]).then((icon) => {
            mapImages[`${category}-${color}`] = prepareIcon(
              // background,
              icon
              // mapPalette[color].main
            );
          })
        );
      });
      await Promise.all(results);
    })
  );
};
