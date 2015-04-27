(function() {
  'use strict';

  angular.module('angular-mapbox').directive('mapbox', function($compile, $q, mapboxService) {
    var _mapboxMap;

    return {
      restrict: 'E',
      transclude: true,
      scope: true,
      replace: true,
      link: function(scope, element, attrs) {
        scope.map = L.mapbox.map(element[0], attrs.mapId);
        _mapboxMap.resolve(scope.map);
        var mapOptions = {
          clusterMarkers: attrs.clusterMarkers !== undefined,
          scaleToFit: attrs.scaleToFit !== undefined
        };
        mapboxService.addMapInstance(scope.map, mapOptions);

		var mapWidth = attrs.width || '500px';
		var mapHeight = attrs.height || '500px';
		element.css('width', mapWidth);
		element.css('height', mapHeight);

        var zoom = attrs.zoom || 12;
        if(attrs.lat && attrs.lng) {   
	        scope.map
        		.setView([attrs.lat, attrs.lng], zoom)
				.invalidateSize();
        }

        if(attrs.onReposition) {
          scope.map.on('dragend', function() {
            scope[attrs.onReposition](scope.map.getBounds());
          });
        }

        if(attrs.onZoom) {
          scope.map.on('zoomend', function() {
            scope[attrs.onZoom](scope.map.getBounds());
          });
        }
      },
      template: '<div class="angular-mapbox-map" ng-transclude></div>',
      controller: function($scope, mapboxService) {
        $scope.markers = mapboxService.getMarkers();
        $scope.featureLayers = [];

        _mapboxMap = $q.defer();
        $scope.getMap = this.getMap = function() {
          return _mapboxMap.promise;
        };

        if(L.MarkerClusterGroup) {
          $scope.clusterGroup = new L.MarkerClusterGroup();
          this.getMap().then(function(map) {
            map.addLayer($scope.clusterGroup);
          });
        }

        this.$scope = $scope;
      }
    };
  });
})();

