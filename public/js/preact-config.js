import { h, render, Component, createContext } from 'https://unpkg.com/preact@10.23.1/dist/preact.module.js';
import { useState, useEffect, useCallback, useRef, useMemo } from 'https://unpkg.com/preact@10.23.1/hooks/dist/hooks.module.js';
import htm from 'https://unpkg.com/htm@3.1.1/dist/htm.module.js';

const html = htm.bind(h);

export {
  h,
  render,
  Component,
  createContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  html
};
