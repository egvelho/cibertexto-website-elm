module Page.About exposing (..)

import Material.Options as Options exposing (when, css, div)
import Material.Color as Color
import Material.Elevation as Elevation
import Material.Typography as Typography
import Material.List as List
import Material.Card as Card

import Html exposing (Html, text)
import Markdown
import Types exposing (Model, Msg)

backgroundImage : Html Msg
backgroundImage =
  Options.stylesheet
    """
      body {
        background-image: url("about-background.svg");
        background-size: cover;
        background-repeat: no-repeat;
        background-position: top;
      }
    """

render : Model -> Html Msg
render model =
  div []
    [ backgroundImage
    , div
        [ css "margin"
            ( if model.viewport == Types.Desktop then
                "40px"
              else
                "16px"
            )
        , css "max-width" "640px"
        ]
        [ Card.view
            [ css "width" "100%"
            , Elevation.e8
            ]
            [ Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Quem somos?" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """A Cibertexto Tecnologia é uma empresa da área da
                    informática que presta serviços de software
                    em **Novo Hamburgo**, RS. Realizamos desde
                    tarefas básicas, como **formatar computadores** ou
                    instalar programas, até tarefas avançadas, como o
                    desenvolvimento de **lojas virtuais e
                    aplicativos para celular**."""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Nosso diferencial" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Apos analisar o cenário da informática
                    na região do Vale dos Sinos, foi observado
                    que as atividades mais básicas deste segmento,
                    como assistência técnica em computadores e
                    celulares, ainda estavam sendo tratadas como
                    se estivéssemos na década passada."""
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """A Cibertexto Tecnologia busca modernizar esta área
                    que há muito foi abandonada. Trazendo novas
                    soluções e levando a interação com o cliente
                    para o ciberespaço."""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Da ciência para o mercado" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Muitos dizem que a ciência é algo irrelevante,
                    tratam a pesquisa como um investimento opcional.
                    **Isto não é verdade!** Se hoje temos dispositivos
                    com um poder computacional imensurável em nossos
                    bolsos, é porque cientístas trabalharam muito e
                    durante muitos anos para desenvolvê-los. **O bom
                    profissional incorpora a ciência em seu meio de
                    trabalho e não a ignora como se teoria e prática
                    fossem atividades distintas**. A Cibertexto
                    Tecnologia é uma empresa empoderada pela pesquisa!"""
                ]
            , Card.title []
                [ Card.head
                    [ Color.text Color.accent ]
                    [ text "Sigilo e privacidade em primeiro lugar" ]
                ]
            , Card.text
                [ css "text-align" "justify"
                , css "width" "auto"
                ]
                [ Markdown.toHtml []
                    """Outra questão que culminou no nascimento da
                    Cibertexto Tecnologia é a forma desrespeitosa como muitas empresas
                    de informática tratam os dados pessoais dos clientes.
                    **A ética, a integridade e o respeito à privacidade** do
                    sujeito são aspectos de base que integram a nossa
                    ideologia."""
                ]
            , Card.media
                [ Color.background <| Color.color Color.Grey Color.S100
                , css "margin-top" "16px"
                ]
                [ List.li
                    [ List.withBody |>
                        when (model.viewport == Types.Tablet || model.viewport == Types.Desktop)
                    ]
                    [ List.content []
                        [ List.avatarImage "velho.jpg" []
                        , text "Enviado por Eduardo Velho"
                        , List.body
                            [ css "display" "none" |> when (model.viewport == Types.Phone) ]
                            [ text
                                """Mestrando em Diversidade
                                Cultural e Inclusão Social e Tecnólogo
                                em Sistemas para Internet."""
                            ]
                        ]
                    ]
                ]
            ]
        ]
    ]
