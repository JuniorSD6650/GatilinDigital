const express = require('express');
const usuariosRoutes = require('./usuarios');
const bordaduriasRoutes = require('./bordadurias');  
const participantesRoutes = require('./participantes');
const organizacionRoutes = require('./organizacion');
const cofradiaRoutes = require('./cofradia'); 
const cofradesRoutes = require('./cofrades'); 
const eventosRoutes = require('./eventos');
const reportesRoutes = require('./reportes'); 

const router = express.Router();

router.use('/usuarios', usuariosRoutes);
router.use('/bordadurias', bordaduriasRoutes); 
router.use('/participantes', participantesRoutes);
router.use('/organizacion', organizacionRoutes);
router.use('/cofradia', cofradiaRoutes);
router.use('/cofrades', cofradesRoutes);
router.use('/eventos', eventosRoutes);
router.use('/reportes', reportesRoutes);

module.exports = router;
