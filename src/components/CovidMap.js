import React, { useState } from "react";
import GoogleMapReact from 'google-map-react';
import { CovidDataService } from "../service/CovidDataService";
import { MapUtils } from "../utils/MapUtils";
import CovidCard from "./CovidCard";

export default function CovidMap(){
  const defaultProps = {
    center: {
      lat: 40,
      lng: -100
    },
    zoom: 6
  };

  // covid data point 会触发rerender
  const[points, setPoints] = useState({});
  // zoomLevel的变化 会触发rerender
  const[zoomLevel, setZoomLevel] = useState(defaultProps.zoom);
  // boundary的变化 会触发rerender
  const[boundary, setBoundary] = useState({});

  // 写一个函数，这个函数，专门用来返回list of CovidCard
  const renderCovidPoints = () => {
    // list of CovidCard that display on current visible area
    let covidCards = [];
    if (zoomLevel < 1 || zoomLevel > 20) {
        return covidCards;
    }
    let pointsLevel = MapUtils.getPointsLevelByZoomLevel(zoomLevel);
    let pointsToRender = points[pointsLevel];
    // Sanity check
    if (!pointsToRender) {
        return covidCards;
    }
    if (pointsLevel === 'county') {
        for (let point of pointsToRender) {
            // check if this point is within current boundary
            if (MapUtils.isInBoundary(boundary, point.coordinates)) {
                covidCards.push(
                    <CovidCard
                        title={point.province}
                        subTitle={point.county}
                        confirmed={point.stats.confirmed}
                        deaths={point.stats.deaths}
                        lat={point.coordinates.latitude}
                        lng={point.coordinates.longitude}
                    />
                )
            }
        }
    } else if (pointsLevel === 'state') {
        for (let state in pointsToRender) {
            let point = pointsToRender[state];
            // check if this point is within current boundary
            if (MapUtils.isInBoundary(boundary, point.coordinates)) {
                covidCards.push(
                    <CovidCard
                        title={point.country}
                        subTitle={state}
                        confirmed={point.confirmed}
                        deaths={point.deaths}
                        lat={point.coordinates.latitude}
                        lng={point.coordinates.longitude}
                    />
                )
            }
        }
    } else {
        for (let nation in pointsToRender) {
            let point = pointsToRender[nation];
            // check if this point is within current boundary
            if (MapUtils.isInBoundary(boundary, point.coordinates)) {
                covidCards.push(
                    <CovidCard
                        subTitle={nation}
                        confirmed={point.confirmed}
                        deaths={point.deaths}
                        lat={point.coordinates.latitude}
                        lng={point.coordinates.longitude}
                    />
                )
            }
        }
    }
    return covidCards;
  }

  return (
    // Important! Always set the container height explicitly
    <div style={{ height: '100vh', width: '100%' }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: "AIzaSyCQzASHtR_pK4E6pLcqIfcsR-VCAlbtVJg" }}
        defaultCenter={defaultProps.center}
        defaultZoom={defaultProps.zoom}
        onGoogleApiLoaded={() => {
            // 1. call JHU API to get covid data
            // 2. call setPoints to update points value -> re-render
            CovidDataService.getAllCountyCases()
                .then((response) => {
                    // 成功的回调函数
                    const countyData = response.data;
                    setPoints(MapUtils.convertCovidPoints(countyData));
                }).catch((error) => {
                    // 失败的回调函数
                    console.error(error);
            })
        }}
        onChange={({ center, zoom, bounds, marginBounds }) => {
            setZoomLevel(zoom);
            setBoundary(bounds);
        }}
      >
        {renderCovidPoints()}
      </GoogleMapReact>
    </div>
  );
}
