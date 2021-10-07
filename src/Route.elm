module Route exposing (lookFor, linkTo)

import Navigation exposing (Location)
import Types exposing (Msg)
import Material.Options as Options
import Generics exposing (onClickPreventDefault)

lookFor : Location -> Msg
lookFor location =
  let
    _ = Debug.log "teste_" location
  in
    case location.hash of
      "#/home" ->
        Types.GoTo Types.Home

      "#/assistencia" ->
        Types.GoTo Types.TechSupport

      "#/andamento" ->
        Types.GoTo Types.Order

      "#/dev" ->
        Types.GoTo Types.Development

      "#/advogados" ->
        Types.GoTo Types.Lawyers

      "#/sobre" ->
        Types.GoTo Types.About

      "#/agendamento" ->
        Types.GoTo Types.Schedule

      _ ->
        Types.GoTo Types.Home

linkTo : String -> Options.Property a Msg
linkTo url_ =
  onClickPreventDefault (Types.LinkTo url_)