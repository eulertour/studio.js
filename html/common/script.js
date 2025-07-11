import { options } from './navigation.js';

export function querySelectorOrThrow(selector) {
  const element = document.querySelector(selector);
  if (element === null) {
    throw new Error(`Element with selector "${selector}" not found`);
  }
  return element;
}

export function setupNavigation() {
  // Create header element
  const header = document.createElement('header');
  
  // Create select element
  const select = document.createElement('select');
  select.id = 'config-selector';
  
  // Get current page
  const currentPage = window.location.pathname.split('/').pop();
  
  // Create and append options
  options.forEach(opt => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.text;
    if (opt.value === currentPage) {
      option.selected = true;
    }
    select.appendChild(option);
  });
  
  // Add change event listener
  select.addEventListener('change', (e) => {
    window.location.href = e.target.value;
  });
  
  // Append select to header
  header.appendChild(select);
  
  // Insert header at the beginning of body
  document.body.insertBefore(header, document.body.firstChild);
}