const express = require('express');
const router = express.Router();
const domainController = require('../controllers/domainController');
const { authenticateToken } = require('../middleware/auth');
const { validateDomainInput, validateWhoisParam } = require('../validators/validators');

router.get('/domains', authenticateToken, domainController.getAllDomains);
router.post('/domains', authenticateToken, validateDomainInput, domainController.createDomain);
router.delete('/domains/:id', authenticateToken, domainController.deleteDomain);
router.get('/whois/:domain', validateWhoisParam, domainController.getWhoisInfo);

module.exports = router;
