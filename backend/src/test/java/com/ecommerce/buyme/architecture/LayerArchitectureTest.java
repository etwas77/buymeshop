package com.ecommerce.buyme.architecture;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

@AnalyzeClasses(packages = "com.ecommerce.buyme")
class LayerArchitectureTest {
    
    @ArchTest
    static final ArchRule controllersMustNotDependOnRepositories =
        noClasses()
            .that().resideInAPackage("..controller..")
            .should().dependOnClassesThat().resideInAPackage("..repository..");

    @ArchTest
    static final ArchRule servicesMustNotDependOnControllers =
        noClasses()
            .that().resideInAPackage("..service..")
            .should().dependOnClassesThat().resideInAPackage("..controller..");

   @ArchTest
   static final ArchRule repositoriesMustNotDependOnUpperLayers =
       noClasses()
           .that().resideInAPackage("..repository..")
           .should().dependOnClassesThat()
           .resideInAnyPackage("..controller..", "..service..");
}
