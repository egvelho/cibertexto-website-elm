module View exposing (view)

import Html exposing (Html, text)
import Html.Events exposing (onClick)

import Material.Options as Options exposing (div)
import Material.Layout as Layout

import Types exposing (Model, Msg, Mdl)

import View.Header as Header
import View.Drawer as Drawer

import Page.Home
import Page.TechSupport
import Page.Order
import Page.Lawyers
import Page.Development
import Page.About
import Page.Schedule

renderPage : Model -> Html Msg
renderPage model =
  let
    pageContent =
      case model.currentPage of
        Types.Home ->
          Page.Home.render model

        Types.TechSupport ->
          Page.TechSupport.render model

        Types.Order ->
          Page.Order.render model

        Types.Lawyers ->
          Page.Lawyers.render model

        Types.Development ->
          Page.Development.render model

        Types.About ->
          Page.About.render model

        Types.Schedule ->
          Page.Schedule.render model

  in
    div [] [ pageContent ]

view : Model -> Html Msg
view model =
  Layout.render Mdl
    model.mdl
      [ Layout.fixedHeader ]
      { header = Header.render model
      , drawer = Drawer.render model
      , tabs = ([], [])
      , main = [ renderPage model ]
      }
