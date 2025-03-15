"use client";

import React from "react";
import Socials from "./socials";
import PythonPlain from "devicons-react/lib/icons/PythonPlain";
import JavascriptPlain from "devicons-react/lib/icons/JavascriptPlain";
import TypescriptPlain from "devicons-react/lib/icons/TypescriptPlain";
import CplusplusPlain from "devicons-react/lib/icons/CplusplusPlain";
import JavaPlain from "devicons-react/lib/icons/JavaPlain";
import GoPlain from "devicons-react/lib/icons/GoPlain";
import NextjsPlain from "devicons-react/lib/icons/NextjsPlain";
import Html5PLain from "devicons-react/lib/icons/Html5Plain";
import Css3Plain from "devicons-react/lib/icons/Css3Plain";
import NodejsPlain from "devicons-react/lib/icons/NodejsPlain";
import FirebasePlainWordmark from "devicons-react/lib/icons/FirebasePlainWordmark";
import PostgresqlPlain from "devicons-react/lib/icons/PostgresqlPlain";
import MongodbPlain from "devicons-react/lib/icons/MongodbPlain";
import DockerPlainWordmark from "devicons-react/lib/icons/DockerPlainWordmark";
import TensorflowLine from "devicons-react/lib/icons/TensorflowLine";
import ScikitlearnPlain from "devicons-react/lib/icons/ScikitlearnPlain";
import GooglecloudPlain from "devicons-react/lib/icons/GooglecloudPlain";
import AmazonwebservicesPlainWordmark from "devicons-react/lib/icons/AmazonwebservicesPlainWordmark";
import GitPlain from "devicons-react/lib/icons/GitPlain";
import PostmanPlain from "devicons-react/lib/icons/PostmanPlain";

const MainComponent = (props) => {
  return (
    <div data-section id="about" className="flex flex-col mb-16 group pt-16">
      <div className="hero-section flex flex-col justify-center items-center text-center py-20 space-y-4">
        <h1 className="text-5xl subpixel-antialiased font-semibold tracking-wide">
          Hi, I'm {props.data.name}.
        </h1>
        <h2 className="text-surface-600 pt-2 text-base subpixel-antialiased font-normal tracking-wider">
          {props.data.headline}
        </h2>
        <Socials data={props.data.socials} />
      </div>
      <div className="text-surface-600">
        {props.data.about.map(function (paragraph, index) {
          return (
            <div key={index} className="mb-6">
              {paragraph}
            </div>
          );
        })}
      </div>
      <div>
        <h2 className="mb-8 text-xl font-medium">Frameworks</h2>
        <div className="mb-6 flex flex-row flex-wrap space-x-2">
          <PythonPlain color="white" size="30" />
          <JavascriptPlain color="white" size="30" />
          <TypescriptPlain color="white" size="30" />
          <CplusplusPlain color="white" size="30" />
          <JavaPlain color="white" size="30" />
          <GoPlain color="white" size="30" />
          <NextjsPlain color="white" size="30" />
          <Html5PLain color="white" size="30" />
          <Css3Plain color="white" size="30" />
          <NodejsPlain color="white" size="30" />
          <FirebasePlainWordmark color="white" size="30" />
          <PostgresqlPlain color="white" size="30" />
          <MongodbPlain color="white" size="30" />
          <DockerPlainWordmark color="white" size="30" />
          <TensorflowLine color="white" size="30" />
          <ScikitlearnPlain color="white" size="30" />
          <GooglecloudPlain color="white" size="30" />
          <AmazonwebservicesPlainWordmark color="white" size="30" />
          <GitPlain color="white" size="30" />
          <PostmanPlain color="white" size="30" />
        </div>
      </div>
    </div>
  );
};

export default MainComponent;
