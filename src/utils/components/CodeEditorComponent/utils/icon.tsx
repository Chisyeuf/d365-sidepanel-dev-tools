import { ReactNode } from 'react'
import { SiHtml5, SiCss3, SiJavascript, SiTypescript, SiJson } from "react-icons/si";
import { FcFolder, FcOpenedFolder, FcPicture, FcFile } from "react-icons/fc";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import { AiFillFileText } from "react-icons/ai";
import React from 'react';

// import { getIconForFile, getIconForFolder, getIconForOpenFolder } from 'vscode-icons-js';
// function getIconHelper() {
//     const cache = new Map<string, ReactNode>();
//     cache.set("js", getIconForFile("js"));
//     cache.set("jsx", getIconForFile("jsx"));
//     cache.set("ts", getIconForFile("ts"));
//     cache.set("tsx", getIconForFile("tsx"));
//     cache.set("css", getIconForFile("css"));
//     cache.set("json", getIconForFile("json"));
//     cache.set("html", getIconForFile("html"));
//     cache.set("png", getIconForFile("png"));
//     cache.set("jpg", getIconForFile("jpg"));
//     cache.set("ico", getIconForFile("ico"));
//     cache.set("txt", getIconForFile("txt"));
//     cache.set("none", getIconForFile(""));
//     cache.set("closedDirectory", getIconForFolder(''));
//     cache.set("openDirectory", getIconForOpenFolder(''));
//     return function (extension: string, name: string): ReactNode {
//         let iconFileName;
//         if (cache.has(extension))
//             iconFileName = cache.get(extension);
//         else if (cache.has(name))
//             iconFileName = cache.get(name);
//         else
//             iconFileName = cache.get("none");
//         return <img src={'./icons/' + iconFileName} alt="file" width="24" />
//     }
// }

function getIconHelper() {
    const cache = new Map<string, ReactNode>();
    cache.set("js", <SiJavascript color="#fbcb38" />);
    cache.set("jsx", <SiJavascript color="#fbcb38" />);
    cache.set("ts", <SiTypescript color="#378baa" />);
    cache.set("tsx", <SiTypescript color="#378baa" />);
    cache.set("css", <SiCss3 color="purple" />);
    cache.set("json", <SiJson color="#5656e6" />);
    cache.set("html", <SiHtml5 color="#e04e2c" />);
    cache.set("png", <FcPicture />);
    cache.set("jpg", <FcPicture />);
    cache.set("ico", <FcPicture />);
    cache.set("txt", <AiFillFileText color="white" />);
    cache.set("closedDirectory", <FaChevronRight />);
    cache.set("openDirectory", <FaChevronDown />);
    return function (extension: string, name: string): ReactNode {
        if (cache.has(extension))
            return cache.get(extension);
        else if (cache.has(name))
            return cache.get(name);
        else
            return <FcFile />;
    }
}

export const getIcon = getIconHelper();
