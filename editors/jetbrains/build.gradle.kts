// Vaerion for JetBrains — build scaffolding.
// HONESTY MARKER: never executed in the Vaerion build environment (no
// IntelliJ SDK / Gradle toolchain exists there). Provided as a credible
// starting point; compile it on a machine with IntelliJ IDEA 2023.2+.
plugins {
    id("java")
    id("org.jetbrains.intellij") version "1.17.4"
}

group = "dev.vaerion.editors"
version = "0.1.13-rc1"

repositories { mavenCentral() }

intellij {
    version.set("2023.2.6")
    type.set("IC")
}

tasks {
    patchPluginXml { sinceBuild.set("232"); untilBuild.set("243.*") }
}
