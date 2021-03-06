$(function () {
  var map, searchBox;
  var markers = [];
  var submitUrl = "";
  var pointToEditId;
  var map_id;

  function initMap() {
    var vancouver = {lat: 49.261, lng: -123.123};
    map = new google.maps.Map(document.getElementById('modal-map'), {
      zoom: 14,
      center: vancouver
    });
  }

  function clearForm() {
    $(".modal-form")[0].reset();
  }


  $('#point-modal').on('show.bs.modal', function() {
    pointToEditId = $(".point-edit-btn").data().pointId;
    submitUrl = "/maps/";
    $(".modal-title").text("Add New Point");
    $(".submit-point").text("Add Point");

    if (pointToEditId) {
      submitUrl += "points/" + pointToEditId;
      $(".modal-title").text("Edit Point");
      $(".submit-point").text("Update Point");

      $.ajax({
        method: "GET",
        url: submitUrl
      }).done((info) => {
        $("#location").val(info[0].lat + ", " + info[0].long);
        $("#title").val(info[0].point_title);
        $("#image").val(info[0].image);
        $("#description").val(info[0].description);
      });
    }
})


  $('#point-modal').on('shown.bs.modal', function() {
    initMap();

    map_id = $(".points-crumb").data().mapId;

    var defaultBounds = new google.maps.LatLngBounds(
    new google.maps.LatLng(49.208824, -123.273213),
    new google.maps.LatLng(49.337625, -122.981046));

    var input = $(".modal-form #location")[0];
    searchBox = new google.maps.places.SearchBox(input, {
      bounds: defaultBounds
    });

    searchBox.addListener("places_changed", function () {

      console.log("places_changed");

      for (var marker of markers) {
        marker.setMap(null);
      }

      var places = searchBox.getPlaces();

      if (places.length === 0) {
        return;
      }

      var place = places[0];

      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      var marker = new google.maps.Marker({
        map: map,
        title: place.name,
        position: place.geometry.location
      });

      map.setCenter(marker.getPosition());

      markers.push(marker);

    })


    if (pointToEditId) {
      var location = $(".modal-form #location").val().split(", ");
      var latlng = new google.maps.LatLng(location[0], location[1]);
      map.setCenter(latlng);
      var marker = new google.maps.Marker({
        map: map,
        position: latlng
      });

      map.setCenter(marker.getPosition());

      markers.push(marker);
    }

  });

  $("#point-modal").on("hidden.bs.modal", function() {
    clearForm();
  });

  $("#point-modal .submit-point").on("click", function() {
    $(".modal-form").submit();
    $("#point-modal").modal('hide');
  })

  $(".modal-form").on("submit", function(event) {
    event.preventDefault();

    var formData = $(this).serialize();

    if (submitUrl === "/maps/") {
      submitUrl += map_id;
    };

    if (searchBox.getPlaces()){
      var place = searchBox.getPlaces()[0];

      formData += "&lat=" + place.geometry.location.lat();
      formData += "&long=" + place.geometry.location.lng();
    }


    $.ajax({
      url: submitUrl,
      method: "POST",
      data: formData
    }).then(function () {
      console.log("Submitted!");
    });
  });

});
