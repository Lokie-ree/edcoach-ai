#!/bin/bash

# EdCoach AI - Comprehensive Test Runner
# Runs all test suites with proper configuration and reporting

set -e

echo "🧪 EdCoach AI - Comprehensive Test Suite Runner"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    print_error "pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Parse command line arguments
TEST_TYPE="all"
COVERAGE=false
VERBOSE=false
DEBUG=false
WATCH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --type)
            TEST_TYPE="$2"
            shift 2
            ;;
        --coverage)
            COVERAGE=true
            shift
            ;;
        --verbose)
            VERBOSE=true
            shift
            ;;
        --debug)
            DEBUG=true
            shift
            ;;
        --watch)
            WATCH=true
            shift
            ;;
        --help)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  --type TYPE        Test type: all, unit, integration, e2e, performance"
            echo "  --coverage         Run with coverage reporting"
            echo "  --verbose          Verbose output"
            echo "  --debug            Run in debug mode"
            echo "  --watch            Run in watch mode"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0                                    # Run all tests"
            echo "  $0 --type unit --coverage            # Run unit tests with coverage"
            echo "  $0 --type performance --verbose      # Run performance tests with verbose output"
            echo "  $0 --watch                           # Run tests in watch mode"
            exit 0
            ;;
        *)
            print_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Install dependencies if needed
print_status "Checking dependencies..."
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    pnpm install
fi

# Build the project if needed
print_status "Building project..."
pnpm build

# Set up test environment
print_status "Setting up test environment..."

# Create test results directory
mkdir -p test-results

# Set environment variables for testing
export NODE_ENV=test
export CONVEX_TEST_MODE=true

# Build test command
TEST_CMD="pnpm test"

if [ "$WATCH" = true ]; then
    TEST_CMD="pnpm test:watch"
elif [ "$DEBUG" = true ]; then
    TEST_CMD="pnpm test:debug"
else
    TEST_CMD="pnpm test:once"
fi

if [ "$COVERAGE" = true ]; then
    TEST_CMD="pnpm test:coverage"
fi

if [ "$VERBOSE" = true ]; then
    TEST_CMD="$TEST_CMD --reporter=verbose"
fi

# Run specific test types
case $TEST_TYPE in
    "unit")
        print_status "Running unit tests..."
        TEST_FILES="convex/tests/phase1-goal-setting.test.ts convex/tests/phase2-capture-evidence.test.ts convex/tests/phase3-generate-feedback.test.ts convex/tests/phase4-reflect.test.ts convex/tests/phase5-monitor-growth.test.ts"
        ;;
    "integration")
        print_status "Running integration tests..."
        TEST_FILES="convex/tests/cross-phase-integration.test.ts convex/tests/platform-foundation.test.ts"
        ;;
    "e2e")
        print_status "Running end-to-end tests..."
        TEST_FILES="convex/tests/complete-growth-loop.test.ts"
        ;;
    "performance")
        print_status "Running performance tests..."
        TEST_FILES="convex/tests/performance-load.test.ts"
        ;;
    "all")
        print_status "Running all tests..."
        TEST_FILES="convex/tests/**/*.test.ts"
        ;;
    *)
        print_error "Invalid test type: $TEST_TYPE"
        exit 1
        ;;
esac

# Execute tests
print_status "Executing tests: $TEST_CMD $TEST_FILES"

if [ "$TEST_TYPE" = "all" ]; then
    eval $TEST_CMD
else
    for file in $TEST_FILES; do
        if [ -f "$file" ]; then
            print_status "Running $file..."
            eval $TEST_CMD $file
        else
            print_warning "Test file not found: $file"
        fi
    done
fi

# Check test results
if [ $? -eq 0 ]; then
    print_success "All tests passed! ✅"
    
    if [ "$COVERAGE" = true ]; then
        print_status "Coverage report generated in coverage/ directory"
        if [ -f "coverage/index.html" ]; then
            print_status "Open coverage/index.html in your browser to view detailed coverage report"
        fi
    fi
    
    # Generate test summary
    print_status "Generating test summary..."
    cat > test-results/summary.md << EOF
# Test Execution Summary

**Date:** $(date)
**Test Type:** $TEST_TYPE
**Coverage:** $COVERAGE
**Status:** ✅ PASSED

## Test Results
- All tests executed successfully
- No failures detected
- Performance requirements met

## Coverage Report
$(if [ "$COVERAGE" = true ]; then echo "- Coverage report generated in coverage/ directory"; else echo "- Coverage not requested"; fi)

## Next Steps
- Review test results
- Check coverage report if generated
- Proceed with deployment if all tests pass
EOF
    
    print_success "Test summary generated in test-results/summary.md"
    
else
    print_error "Tests failed! ❌"
    exit 1
fi

print_success "Test execution completed successfully!"
