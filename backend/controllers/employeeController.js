const Employee = require('../models/Employee');
const Asset = require('../models/Asset');
const logActivity = require('../utils/logActivity');

// @desc    Get all employees with search, filter, and pagination
// @route   GET /api/employees
// @access  Private
const getEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const query = {};

    // Filter by search keyword
    if (search && search.trim() !== '') {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: regex },
        { email: regex },
        { employeeId: regex },
        { designation: regex },
        { department: regex },
      ];
    }

    // Filter by department
    if (department && department !== 'all') {
      query.department = department;
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Total count matching query
    const total = await Employee.countDocuments(query);

    // Fetch employees
    const employees = await Employee.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Attach count of active assigned assets for each employee
    const employeesWithAssetCount = await Promise.all(
      employees.map(async (emp) => {
        const assignedAssetsCount = await Asset.countDocuments({
          assignedTo: emp._id,
          status: 'Assigned',
        });
        return {
          ...emp.toObject(),
          assignedAssetsCount,
        };
      })
    );

    return res.status(200).json({
      success: true,
      count: employeesWithAssetCount.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      data: employeesWithAssetCount,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee details with currently assigned assets
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id: ${req.params.id}`,
      });
    }

    // Find all assets assigned to this employee
    const assignedAssets = await Asset.find({ assignedTo: employee._id });

    return res.status(200).json({
      success: true,
      data: {
        ...employee.toObject(),
        assignedAssets,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee
// @route   POST /api/employees
// @access  Private (Admin / Staff)
const createEmployee = async (req, res, next) => {
  try {
    const { employeeId, name, email, phone, department, designation, joiningDate, status } = req.body;

    // Validate required fields
    if (!employeeId || !name || !email || !phone || !department || !designation) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: employeeId, name, email, phone, department, designation',
      });
    }

    // Check duplicate employeeId or email
    const idExists = await Employee.findOne({ employeeId: employeeId.toUpperCase().trim() });
    if (idExists) {
      return res.status(400).json({
        success: false,
        message: `Employee ID '${employeeId}' is already registered to another employee.`,
      });
    }

    const emailExists = await Employee.findOne({ email: email.toLowerCase().trim() });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' is already in use by another employee.`,
      });
    }

    const employee = await Employee.create({
      employeeId: employeeId.toUpperCase().trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      department: department.trim(),
      designation: designation.trim(),
      joiningDate: joiningDate || Date.now(),
      status: status || 'Active',
    });

    // Record activity
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
      action: 'EMPLOYEE_CREATED',
      details: `Created new employee ${employee.name} (${employee.employeeId}) in ${employee.department}`,
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee details
// @route   PUT /api/employees/:id
// @access  Private (Admin / Staff)
const updateEmployee = async (req, res, next) => {
  try {
    let employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id: ${req.params.id}`,
      });
    }

    // Check email uniqueness if email is changed
    if (req.body.email && req.body.email.toLowerCase() !== employee.email) {
      const emailExists = await Employee.findOne({ email: req.body.email.toLowerCase() });
      if (emailExists && emailExists._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: `Email '${req.body.email}' is already in use.`,
        });
      }
    }

    // Check employeeId uniqueness if changed
    if (req.body.employeeId && req.body.employeeId.toUpperCase() !== employee.employeeId) {
      const idExists = await Employee.findOne({ employeeId: req.body.employeeId.toUpperCase() });
      if (idExists && idExists._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: `Employee ID '${req.body.employeeId}' is already in use.`,
        });
      }
    }

    employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Record activity
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
      action: 'EMPLOYEE_UPDATED',
      details: `Updated employee record for ${employee.name} (${employee.employeeId})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin Only)
const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: `Employee not found with id: ${req.params.id}`,
      });
    }

    // Check if active assets are assigned
    const activeAssetsCount = await Asset.countDocuments({
      assignedTo: employee._id,
      status: 'Assigned',
    });

    if (activeAssetsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete employee. ${activeAssetsCount} active asset(s) are currently assigned to this employee. Please return them first.`,
      });
    }

    await employee.deleteOne();

    // Record activity
    await logActivity({
      userId: req.user ? req.user._id : null,
      userName: req.user ? req.user.name : 'Admin',
      action: 'EMPLOYEE_DELETED',
      details: `Deleted employee ${employee.name} (${employee.employeeId})`,
    });

    return res.status(200).json({
      success: true,
      message: 'Employee deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
