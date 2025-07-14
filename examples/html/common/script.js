import { options } from '../../config.js';

export function querySelectorOrThrow(selector) {
  const element = document.querySelector(selector);
  if (element === null) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  return element;
}

export function loadSceneFromConfig() {
  // Get the title from URL hash or find config by current file
  const hash = window.location.hash.slice(1); // Remove # character
  let config;
  
  if (hash) {
    // Decode the URL-encoded title from hash
    const decodedTitle = decodeURIComponent(hash);
    config = options.find(opt => opt.title === decodedTitle);
  } else {
    // Find config by current file
    const currentFile = window.location.pathname.split('/').pop();
    config = options.find(opt => opt.file === currentFile || opt.template === currentFile);
  }
  
  const scenePath = config?.scene || "../../scenes/main.ts";
  return import(/* @vite-ignore */ scenePath).then(module => module.default);
}

export function setupNavigation() {
  // Create header element
  const header = document.createElement('header');
  
  // Create select element
  const select = document.createElement('select');
  select.id = 'config-selector';
  
  // Get current config
  const hash = window.location.hash.slice(1);
  let currentConfig;
  
  if (hash) {
    const decodedTitle = decodeURIComponent(hash);
    currentConfig = options.find(opt => opt.title === decodedTitle);
  } else {
    const currentFile = window.location.pathname.split('/').pop();
    currentConfig = options.find(opt => opt.file === currentFile || opt.template === currentFile);
  }
  
  // Create and append options
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.title;
    option.textContent = opt.title;
    if (opt === currentConfig) {
      option.selected = true;
      // Set the page title from the config
      document.title = opt.title;
    }
    select.appendChild(option);
  });
  
  // Add change event listener
  select.addEventListener('change', (e) => {
    const selectedOption = options.find(opt => opt.title === e.target.value);
    if (selectedOption?.template) {
      // If the option has a template, navigate to the template with URL-encoded title as hash
      window.location.href = `${selectedOption.template}#${encodeURIComponent(selectedOption.title)}`;
    } else if (selectedOption?.file) {
      window.location.href = selectedOption.file;
    }
  });
  
  // Append select to header
  header.appendChild(select);
  
  // Insert header at the beginning of body
  document.body.insertBefore(header, document.body.firstChild);
}