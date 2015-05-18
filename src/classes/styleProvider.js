var ngStyleProvider = function($scope, grid) {
    $scope.headerCellStyle = function(col) {
        return { "height": col.headerRowHeight + "px" };
    };
    $scope.rowStyle = function (row) {
        var ret = { "top": row.offsetTop + "px", "height": $scope.rowHeight + "px" };
        if (row.isAggRow) {
            ret.left = row.offsetLeft;
        }
        return ret;
    };
    $scope.canvasStyle = function() {
        return { "height": grid.maxCanvasHt + "px" };
    };
    $scope.rowsHolderStyle = function () {
        var rowIndex, rowsHeight = 0;

        if ($scope.renderedRows.length) {
            _.each($scope.renderedRows, function (row) { 
                grid.filteredRows[row.rowIndex].rowHeight = row.elm && row.elm.outerHeight() || grid.config.rowHeight;
            });

            for (rowIndex = 0; rowIndex < $scope.renderedRows[0].rowIndex; rowIndex++) {
                rowsHeight += grid.filteredRows[rowIndex].rowHeight || grid.config.rowHeight;
            }
        }

        return { "top": rowsHeight + "px", "height": $scope.viewportDimHeight() + "px" };
    };
    $scope.headerScrollerStyle = function() {
        return { "height": grid.config.headerRowHeight + "px" };
    };
    $scope.topPanelStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": $scope.topPanelHeight() + "px" };
    };
    $scope.headerStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": grid.config.headerRowHeight + "px" };
    };
    $scope.groupPanelStyle = function () {
        return { "width": grid.rootDim.outerWidth + "px", "height": "32px" };
    };
    $scope.viewportStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": $scope.viewportDimHeight() + "px" };
    };
    $scope.footerStyle = function() {
        return { "width": grid.rootDim.outerWidth + "px", "height": $scope.footerRowHeight + "px" };
    };
};