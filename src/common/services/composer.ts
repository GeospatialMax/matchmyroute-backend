// DO NOT EDIT THIS FILE UNLESS YOU KNOW WHAT YOU ARE DOING!!!!!!

// IMPORT MICROSERVICES
import { image, imagePin } from "./image";

export const services: { [key: string]: any } = {};

// ADD MICROSERVICES TO EXPORT
services[imagePin] = image;