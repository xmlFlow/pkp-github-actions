#!/bin/bash

npx cypress run --headless --browser chrome --config '{"specPattern":["cypress/tests/data/**/*.cy.js"]}'
npx cypress run --headless --browser chrome --config '{"specPattern":["lib/pkp/cypress/tests/integration/**/*.cy.js"]}'
if [ -d "cypress/tests/integration" ]; then
  npx cypress run --headless --browser chrome --config '{"specPattern":["cypress/tests/integration/**/*.cy.js"]}'
fi