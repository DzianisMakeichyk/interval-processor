# Interval Processor
This processor works only with integers!

A Node.js solution for processing interval sets with include and exclude operations. Takes two inputs (include intervals and exclude intervals) and outputs the result of applying all includes and removing all excludes as non-overlapping, sorted intervals.


## 📍 Quick Navigation

- [🚀 Features](#-features)
- [� Installation](#-installation)  
- [💻 Usage](#-usage)
- [📁 Examples](#-examples)
- [🏗️ Project Structure](#️-project-structure)
- [🧪 Testing](#-testing)
- [⚡ Performance](#-performance)
- [🔧 Technical Details](#-technical-details)

## 🚀 Features

- **High Performance** - O(n log n) sweep line algorithm
- **Memory Monitoring** - Real-time memory usage and performance stats
- **Modern ES Modules** - Native ESM support with Node.js v22
- **JSDoc Documentation** - Comprehensive type hints and API documentation
- **Beautiful CLI** - Unicode interface with color output
- **Multiple Input Formats** - Direct arguments or JSON files
- **Comprehensive Testing** - 150+ test cases with Jest
- **Production Ready** - Error handling and validation

## 📦 Installation

```bash
# Clone and install
git clone https://github.com/DzianisMakeichyk/interval-processor.git
cd interval-processor
npm install

# Run tests
npm test
```

**Requirements:** Node.js v22.0.0 or higher

## 💻 Usage

### Command Line Interface

```bash
# Basic usage
node cli.js -i "10-100" -e "20-30"
# Output: 10-19, 31-100

# Multiple intervals
node cli.js -i "50-5000,10-100" -e "95-205"
# Output: 10-94, 206-5000

# File input
node cli.js --file input.json

# Help
node cli.js --help
```

### Input Formats

**Direct Arguments:**
- Single: `"10-100"`
- Multiple: `"10-100,200-300,400-500"`
- Negative: `"-50--10"` (from -50 to -10)

**JSON File Formats:**

Single object:
```json
{
  "includes": ["10-100", "200-300"],
  "excludes": ["20-30", "250-280"]
}
```

Multiple sets:
```json
[
  {
    "includes": ["10-100", "200-300"], 
    "excludes": ["20-30", "250-280"]
  },
  {
    "includes": ["400-500"],
    "excludes": ["450-460"]
  }
]
```

String format:
```json
{
  "includes": "10-100,200-300",
  "excludes": "20-30,250-280"
}
```

## 📁 Examples

| Input | Output |
|-------|--------|
| **Includes:** `10-100`<br>**Excludes:** `20-30` | `10-19, 31-100` |
| **Includes:** `50-5000, 10-100`<br>**Excludes:** none | `10-5000` |
| **Includes:** `200-300, 50-150`<br>**Excludes:** `95-205` | `50-94, 206-300` |

### CLI Output Features

The CLI provides comprehensive statistics:

```
📊 Statistics:
   • Number of intervals: 2
   • Total coverage: 89 individual numbers
   • Total excluded: 11 individual numbers

⚡ Performance:
   • Execution time: 0.22 ms
   • Memory growth: 0.02 MB
   • Peak heap used: 4.37 MB
```

## 🏗️ Project Structure

```
interval-processor/
├── 📄 cli.js                 # Main CLI entry point
├── 📄 input.json             # Example input file
├── 📄 package.json           # Project configuration (ESM)
├── 📄 jest.config.js         # Jest configuration
│
├── 📁 src/                   # Source code
│   ├── 📁 cli/               # Command line interface
│   │   ├── commands.js       # CLI command handlers
│   │   ├── formatters.js     # Output formatting utilities  
│   │   └── index.js          # CLI exports
│   │
│   ├── 📁 core/              # Core algorithm implementation
│   │   ├── Interval.js       # Interval class with operations
│   │   ├── IntervalProcessor.js # Main processing logic
│   │   └── index.js          # Core exports
│   │
│   └── 📁 utils/             # Utilities and helpers
│       ├── constants.js      # Project constants
│       ├── helpers.js        # Helper functions
│       ├── parsers.js        # Input parsing utilities
│       ├── statistics.js     # Memory & performance stats
│       ├── validators.js     # Input validation
│       └── index.js          # Utils exports
│
└── 📁 test/                  # Test suites (mirrors src/ structure)
    ├── 📁 cli/               # CLI tests
    ├── 📁 core/              # Core algorithm tests
    └── 📁 utils/             # Utility tests
```

### Component Descriptions

#### 🔧 Core Components
- **`Interval.js`** - Represents a single interval with operations (merge, subtract, overlap detection)
- **`IntervalProcessor.js`** - Main processing engine using sweep line algorithm
- **`statistics.js`** - Real-time memory monitoring and comprehensive performance stats

#### 🎨 CLI Components  
- **`commands.js`** - Handles file processing, argument parsing, and statistics collection
- **`formatters.js`** - Beautiful Unicode output with colors and emojis

#### 🛠️ Utilities
- **`constants.js`** - Regex patterns, error messages, and project constants
- **`helpers.js`** - Validation helpers, safe integer parsing, and result creators  
- **`parsers.js`** - Converts strings to interval objects with error handling
- **`statistics.js`** - Real-time memory monitoring and comprehensive performance stats
- **`validators.js`** - Input validation for CLI arguments and JSON files

## 🧪 Testing

```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # Generate coverage report
```

- **150+ test cases** covering all functionality
- **90%+ coverage** on core components
- **ES Modules testing** with experimental VM modules
- **Jest configuration** optimized for Node.js v22

## ⚡ Performance

- **Algorithm:** Optimized O(n log n) sweep line algorithm with break-left/break-right optimization
- **Speed:** Processes 10,000 intervals in ~27ms (34x faster than naive O(n²) approach)
- **Monitoring:** Real-time memory usage tracking
- **Large datasets:** Handles 10,000+ intervals efficiently
- **Optimization:** Early termination when exclude intervals are beyond current processing range

### Performance Benchmarks

| Dataset Size | Processing Time | Memory Usage | Performance Gain |
|-------------|----------------|--------------|------------------|
| 1,000 intervals | <5ms | ~5MB | Baseline |
| 10,000 intervals | ~27ms | ~18MB | 34x vs naive approach |
| Complex overlaps | Consistent | Linear growth | Early break optimization |

**Note:** Performance test can be run with `npm run performance` to validate on your system.

## 🔧 Technical Details

### Technology Stack
- **Runtime:** Node.js v22+ with native ES modules
- **Testing:** Jest with experimental VM modules
- **Code Style:** Modern JavaScript (ES2022+) with comprehensive JSDoc
- **Documentation:** JSDoc type annotations for IDE support and API clarity
- **Memory Monitoring:** Built-in process.memoryUsage() tracking

### Memory Statistics Features
- **Real-time monitoring** during interval processing
- **Memory growth tracking** before/after operations
- **Peak heap usage** monitoring
- **Execution time** measurement in milliseconds

### Scripts

```bash
npm start           # Run CLI
npm test            # Run tests (with experimental VM modules)
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Generate coverage report
npm run performance # Run performance benchmarks (10k intervals)
npm run lint        # ESLint checking
npm run format      # Prettier formatting
npm run clean       # Clean coverage reports
```

Built with ❤️ for Vimond's engineers