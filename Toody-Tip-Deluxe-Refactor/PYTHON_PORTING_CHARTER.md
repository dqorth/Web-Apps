# Python Porting Charter: TipSplit Deluxe CLI
## Enhanced Version for Claude Sonnet 4 & GitHub Copilot Development Team

---

## 1. Project Goal & Vision

### 1.1. Mission Statement
Port the "Toody's TipSplit Deluxe" application from a client-side JavaScript web app to a robust, modular command-line interface (CLI) application written in Python 3.11+.

The JavaScript implementation is **production-ready and feature-complete**, serving as a comprehensive reference for exact functionality replication. The Python CLI must maintain 100% feature parity while adapting the user experience for terminal-based interaction.

### 1.2. Target Environment & Technology Stack
- **Language**: Python 3.11+
- **Interface**: Command-Line Interface (CLI) with rich formatting
- **Data Persistence**: JSON files replacing localStorage
- **Dependencies**: Minimal external dependencies (rich, click, or similar for enhanced CLI experience)
- **Testing**: pytest for unit and integration tests
- **Architecture**: Modular design with clear separation of concerns

---

## 2. Reference Documentation & Current State

### 2.1. Primary Reference Documents (CRITICAL)
| Document | Role | Usage |
|----------|------|-------|
| `REFACTORING_SPECIFICATION.md` | **SOURCE OF TRUTH** | Contains exact data models, business logic, and calculation formulas |
| `FEATURE_DEFAULT_PAY_RATES_COMPLETE.md` | Feature specification | Default pay rate system requirements |
| `EXCELJS_IMPLEMENTATION_COMPLETE.md` | Export functionality | Excel export requirements and formatting |
| `COLLAPSIBLE_DAYS_FIX_SUMMARY.md` | UI behavior | Weekly report display logic |
| `js/calculations.js` | Business logic | Core calculation algorithms (REFERENCE ONLY) |
| `js/state.js` | Data management | State structure and localStorage patterns |

### 2.2. JavaScript Implementation Status
The JavaScript version includes these **completed and tested features**:

✅ **Employee Management**
- Add/Edit/Delete employees with multiple positions
- Default pay rate system with customizable rates per position
- Data validation and persistence

✅ **Shift Management**
- Log shifts with precise time tracking
- Position-specific wage calculations
- Comprehensive tip tracking (CC tips, cash tips, tip out/in)
- Sales tracking for servers
- Edit/Delete functionality

✅ **Calculation Engine**
- Precise wage calculations with proper rounding
- Complex tip distribution logic
- Daily scoop totals and weekly summaries
- Tax-ready tip reporting

✅ **Data Export**
- Professional Excel export with styling
- Weekly CSV export capabilities
- Formatted reports with proper headers

✅ **Data Persistence**
- localStorage integration with versioning
- State management with backup/restore
- Data import/export functionality

---

## 3. Enhanced Python Architecture

### 3.1. Proposed File Structure
```
tipsplit_cli/
├── main.py                    # Application entry point & main loop
├── models/
│   ├── __init__.py
│   ├── employee.py           # Employee data class
│   ├── shift.py              # Shift data class  
│   └── state.py              # Application state management
├── storage/
│   ├── __init__.py
│   ├── json_storage.py       # JSON file operations
│   └── data_migration.py     # Data import/export utilities
├── calculations/
│   ├── __init__.py
│   ├── wage_calculator.py    # Wage calculation logic
│   ├── tip_calculator.py     # Tip distribution logic
│   └── report_generator.py   # Weekly/daily report calculations
├── ui/
│   ├── __init__.py
│   ├── cli_interface.py      # Main CLI interaction
│   ├── menu_system.py        # Menu navigation
│   ├── input_handlers.py     # User input validation
│   └── formatters.py         # Output formatting
├── utils/
│   ├── __init__.py
│   ├── date_utils.py         # Date manipulation utilities
│   ├── validation.py         # Input validation helpers
│   └── constants.py          # Application constants
├── tests/
│   ├── __init__.py
│   ├── test_calculations.py  # Calculation accuracy tests
│   ├── test_models.py        # Data model tests
│   └── test_integration.py   # End-to-end tests
├── data/
│   ├── employees.json        # Employee data storage
│   ├── shifts.json           # Shift data storage
│   └── config.json           # Application configuration
├── requirements.txt          # Python dependencies
├── README.md                 # Project documentation
└── setup.py                  # Package configuration
```

### 3.2. Core Data Models (from REFACTORING_SPECIFICATION.md)

#### Employee Model
```python
@dataclass
class Employee:
    id: str
    name: str
    positions: List[str]
    pay_rates: Dict[str, float]
    created_date: str
    
    # Derived from JavaScript specification
    JOB_POSITIONS = ["Server", "Busser", "Shake Spinner", "Food Runner", "Host"]
```

#### Shift Model  
```python
@dataclass
class Shift:
    id: str
    date: str  # YYYY-MM-DD format
    employee_id: str
    employee_name: str
    position_worked: str
    shift_pay_rate: float
    time_in: str  # HH:MM format
    time_out: str  # HH:MM format
    hours_worked: float
    shift_wage: float
    total_sales: Optional[float]  # Server only
    cc_tips: Optional[float]      # Server only
    cash_tips: Optional[float]    # Server only
    tip_out_given: Optional[float]    # Server only
    tip_in_received: Optional[float]  # Non-server only
    tips_for_taxes: float
```

---

## 4. Development Roadmap & Implementation Plan

### Phase 1: Foundation & Data Models (Priority: CRITICAL)
**Goal**: Establish core data structures and storage

**Tasks**:
- [ ] Create project structure as outlined in Section 3.1
- [ ] Implement Employee and Shift data classes with validation
- [ ] Create JSON storage system with error handling
- [ ] Implement data migration utilities for JavaScript data import
- [ ] Create unit tests for data models

**Acceptance Criteria**:
- [ ] All data models match JavaScript specification exactly
- [ ] JSON storage can save/load data reliably
- [ ] Data validation prevents invalid entries
- [ ] Can import existing JavaScript localStorage data

### Phase 2: Calculation Engine (Priority: CRITICAL)
**Goal**: Port exact calculation logic from JavaScript

**Tasks**:
- [ ] Port wage calculation logic from `js/calculations.js`
- [ ] Implement tip distribution algorithms
- [ ] Create daily scoop calculation functions
- [ ] Implement weekly summary generation
- [ ] Create comprehensive test suite comparing Python vs JavaScript results

**Acceptance Criteria**:
- [ ] Python calculations match JavaScript output exactly (to the cent)
- [ ] All edge cases from JavaScript are handled
- [ ] Performance is acceptable for typical dataset sizes
- [ ] Calculation tests pass with 100% accuracy

### Phase 3: Core CLI Interface (Priority: HIGH)
**Goal**: Create functional CLI for basic operations

**Tasks**:
- [ ] Implement main menu system with navigation
- [ ] Create employee management interface (add/edit/delete)
- [ ] Implement shift logging interface with validation
- [ ] Create basic report display functionality
- [ ] Add error handling and user feedback

**Acceptance Criteria**:
- [ ] All employee operations work via CLI
- [ ] Shift logging captures all required data
- [ ] Basic reports display correctly
- [ ] User input is validated and errors handled gracefully

### Phase 4: Advanced Features (Priority: MEDIUM)
**Goal**: Implement advanced functionality

**Tasks**:
- [ ] Create weekly report generation with formatting
- [ ] Implement default pay rate system
- [ ] Add data export functionality (CSV format initially)
- [ ] Create data backup/restore features
- [ ] Add configuration management

**Acceptance Criteria**:
- [ ] Weekly reports match JavaScript output format
- [ ] Default pay rates system works as specified
- [ ] Data export produces usable files
- [ ] Configuration is persistent and user-friendly

### Phase 5: Polish & Enhancement (Priority: LOW)
**Goal**: Enhance user experience and add advanced features

**Tasks**:
- [ ] Implement Excel export using openpyxl (matching JavaScript styling)
- [ ] Add advanced reporting features
- [ ] Create data analytics and insights
- [ ] Implement configuration wizard for first-time setup
- [ ] Add comprehensive help system

**Acceptance Criteria**:
- [ ] Excel export matches JavaScript version styling
- [ ] Advanced features enhance usability
- [ ] Help system provides comprehensive guidance
- [ ] User experience is polished and professional

---

## 5. Critical Implementation Notes

### 5.1. Calculation Accuracy Requirements
The Python implementation MUST produce **identical results** to the JavaScript version. Key areas requiring exact replication:

1. **Wage Calculations**: `hours_worked * hourly_rate` with proper rounding
2. **Tip Distribution**: Complex logic for tip out/in calculations
3. **Tax Reporting**: Tips for taxes calculations
4. **Time Calculations**: Precise hour calculations from time strings

### 5.2. Data Migration Strategy
The CLI must be able to import existing data from the JavaScript version:

1. **localStorage Export**: Create JavaScript utility to export localStorage to JSON
2. **Data Mapping**: Map JavaScript data structures to Python models
3. **Validation**: Ensure imported data meets Python validation requirements
4. **Backup**: Always backup existing data before migration

### 5.3. Error Handling Requirements
Implement comprehensive error handling for:

1. **File Operations**: Missing files, permission errors, corruption
2. **User Input**: Invalid data, missing fields, type errors
3. **Calculations**: Division by zero, negative values, overflow
4. **Data Consistency**: Orphaned records, invalid references

---

## 6. Testing & Quality Assurance

### 6.1. Test Coverage Requirements
- **Unit Tests**: 90%+ coverage for calculations and data models
- **Integration Tests**: All CLI workflows tested end-to-end
- **Accuracy Tests**: Python vs JavaScript calculation comparison
- **Performance Tests**: Acceptable performance with large datasets

### 6.2. Test Data Sets
Use the following test scenarios:
1. **Small Dataset**: 5 employees, 20 shifts (for development)
2. **Medium Dataset**: 15 employees, 100 shifts (for testing)
3. **Large Dataset**: 50 employees, 500+ shifts (for performance)
4. **Edge Cases**: Various edge cases from JavaScript bug tracker

---

## 7. First Task for the Development Team

To begin the project and confirm understanding of this charter:

1. **Acknowledge Charter**: Confirm understanding of requirements and approach
2. **Create Project Structure**: Set up the directory structure from Section 3.1
3. **Initialize Git Repository**: Create version control with proper .gitignore
4. **Set Up Development Environment**: Create requirements.txt and virtual environment
5. **Create Initial Files**: Generate empty Python files with basic docstrings

**Response Format**: 
```
Charter acknowledged and understood.
Project structure created with all required directories and files.
Development environment initialized with Python 3.11+ and virtual environment.
Git repository initialized with appropriate .gitignore.
Ready to begin Phase 1 implementation.
```

---

## 8. Success Criteria

The Python CLI port is considered successful when:

1. **Feature Parity**: All JavaScript functionality is available via CLI
2. **Calculation Accuracy**: 100% accuracy compared to JavaScript version
3. **Data Migration**: Can import and export data seamlessly
4. **User Experience**: CLI is intuitive and efficient for terminal users
5. **Performance**: Handles typical restaurant data volumes efficiently
6. **Reliability**: Robust error handling and data persistence
7. **Maintainability**: Clean, well-documented, modular codebase

---

**Document Version**: 1.0  
**Created**: 2025-06-17  
**Target Python Version**: 3.11+  
**Reference Implementation**: JavaScript version (production-ready)  
**Team**: Claude Sonnet 4 & GitHub Copilot
